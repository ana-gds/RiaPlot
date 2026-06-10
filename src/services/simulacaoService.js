/**
 * simulacaoService.js
 *
 * Lógica de simulação no frontend — chama os endpoints Laravel (proxy),
 * faz polling até status==2 e devolve os resultados prontos a colorir.
 *
 * Uso:
 *   import { simularRota, obterMares } from '@/services/simulacaoService';
 *
 *   const resultado = await simularRota({
 *     pontos: route.trackpoints,    // [{lat, lng, ele}, ...]
 *     data:   '2026-06-10',
 *     hora:   '14:30',
 *     calado: 0.5,
 *     folgaSuperior: 0.2,
 *     folgaInferior: 0.1,
 *     onProgress: (msg) => setStatus(msg),
 *   });
 *
 *   const mares = await obterMares({ latitude: 40.64, longitude: -8.73 });
 */

const API_BASE = '/api/simulacao';
const POLL_INTERVAL_MS = 500;   // polling a cada 500ms (API é rápida)
const POLL_MAX_TENTATIVAS = 60; // max 30 segundos antes de desistir

// ---------------------------------------------------------------------------
// Simulação de rota — nível de água + cores
// ---------------------------------------------------------------------------

/**
 * Simula uma rota e devolve os pontos coloridos.
 *
 * @param {Object} params
 * @param {Array}  params.pontos          - trackpoints [{lat, lng, ele}]
 * @param {string} params.data            - 'YYYY-MM-DD'
 * @param {string} params.hora            - 'HH:MM'
 * @param {number} params.calado          - calado do barco em metros
 * @param {number} params.folgaSuperior   - folga superior em metros (default 0.2)
 * @param {number} params.folgaInferior   - folga inferior em metros (default 0.1)
 * @param {Function} [params.onProgress] - callback com mensagens de estado
 *
 * @returns {Promise<SimulacaoResultado>}
 */
export async function simularRota({
  pontos,
  data,
  hora,
  calado = 1.0,
  folgaSuperior = 0.2,
  folgaInferior = 0.1,
  onProgress = () => {},
}) {
  // Converter trackpoints para o formato que a API espera
  const pontosAPI = pontos.map((p) => ({
    latitude:  p.lat,
    longitude: p.lng,
  }));

  // 1. Iniciar execução
  onProgress('A iniciar simulação...');
  const inicioRes = await fetch(`${API_BASE}/iniciar`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ pontos: pontosAPI, data, hora }),
  });

  if (!inicioRes.ok) {
    const err = await inicioRes.json().catch(() => ({}));
    throw new SimulacaoError('Não foi possível iniciar a simulação', err);
  }

  const { executionId, cached } = await inicioRes.json();

  if (cached) {
    onProgress('A carregar resultado em cache...');
  } else {
    // 2. Polling de estado
    onProgress('A calcular...');
    await aguardarConclusao(executionId, 'rota', onProgress);
  }

  // 3. Obter resultados
  onProgress('A processar resultados...');
  const params = new URLSearchParams({
    calado,
    folga_superior: folgaSuperior,
    folga_inferior: folgaInferior,
  });

  const dadosRes = await fetch(`${API_BASE}/${executionId}/dados?${params}`);

  if (!dadosRes.ok) {
    throw new SimulacaoError('Erro ao obter dados da simulação');
  }

  const resultado = await dadosRes.json();
  onProgress('Simulação concluída');

  return resultado;
}

// ---------------------------------------------------------------------------
// Preia-mar / Baixa-mar
// ---------------------------------------------------------------------------

/**
 * Obtém PM/BM para os próximos 4 dias num ponto geográfico.
 *
 * @param {Object} params
 * @param {number} params.latitude
 * @param {number} params.longitude
 * @param {Function} [params.onProgress]
 *
 * @returns {Promise<{eventos: MaresEvento[]}>}
 */
export async function obterMares({
  latitude,
  longitude,
  onProgress = () => {},
}) {
  onProgress('A calcular marés...');

  const inicioRes = await fetch(`${API_BASE}/mares`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify({ latitude, longitude }),
  });

  if (!inicioRes.ok) {
    throw new SimulacaoError('Não foi possível calcular marés');
  }

  const { executionId, cached } = await inicioRes.json();

  if (!cached) {
    await aguardarConclusao(executionId, 'mares', onProgress);
  }

  const dadosRes = await fetch(`${API_BASE}/mares/${executionId}/dados`);

  if (!dadosRes.ok) {
    throw new SimulacaoError('Erro ao obter dados de marés');
  }

  const resultado = await dadosRes.json();
  onProgress('Marés calculadas');

  return resultado;
}

// ---------------------------------------------------------------------------
// Helpers internos
// ---------------------------------------------------------------------------

/**
 * Polling genérico — aguarda até status==2 ou lança erro após timeout.
 *
 * @param {string} executionId
 * @param {'rota'|'mares'} tipo
 * @param {Function} onProgress
 */
async function aguardarConclusao(executionId, tipo, onProgress) {
  const urlStatus = tipo === 'mares'
    ? `${API_BASE}/mares/${executionId}/status`
    : `${API_BASE}/${executionId}/status`;

  for (let tentativa = 0; tentativa < POLL_MAX_TENTATIVAS; tentativa++) {
    await sleep(POLL_INTERVAL_MS);

    const statusRes = await fetch(urlStatus);
    if (!statusRes.ok) continue;

    const { status } = await statusRes.json();

    if (status === 2) return; // concluído

    if (status === -1) {
      throw new SimulacaoError('A simulação falhou no servidor da Hidromod');
    }

    // Mensagens de progresso baseadas no número de tentativas
    if (tentativa < 5)      onProgress('A processar...');
    else if (tentativa < 15) onProgress('Ainda a calcular...');
    else                    onProgress('A demorar mais que o habitual...');
  }

  throw new SimulacaoError('Timeout — a simulação demorou demasiado');
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// Classe de erro customizada
// ---------------------------------------------------------------------------

export class SimulacaoError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name    = 'SimulacaoError';
    this.details = details;
  }
}

// ---------------------------------------------------------------------------
// JSDoc types
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} SimulacaoResultado
 * @property {PontoColorido[]} positions
 * @property {string}          startDate
 * @property {number}          calado
 * @property {number}          folgaSup
 * @property {number}          folgaInf
 *
 * @typedef {Object} PontoColorido
 * @property {number} lat
 * @property {number} lng
 * @property {number} z          - batimetria base
 * @property {number} waterLevel - nível de água simulado
 * @property {number} profReal   - profundidade real calculada
 * @property {number} folga
 * @property {'green'|'yellow'|'red'|'black'|'purple'} color
 *
 * @typedef {Object} MaresEvento
 * @property {'PM'|'BM'} tipo
 * @property {string}    datetime  - ISO string
 * @property {number}    altura    - metros
 */
