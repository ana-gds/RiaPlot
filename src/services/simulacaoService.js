import { API_URL } from '../config.js';

const API_BASE = `${API_URL}/simulacao`;

function authHeaders(token, extra = {}) {
  return {
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...extra,
  };
}

/**
 * Calcula a navegabilidade de uma rota para a data/hora e barco indicados.
 *
 * @param {Object} params
 * @param {string} params.routeId        - _id da rota no MongoDB
 * @param {string} params.data           - 'YYYY-MM-DD'
 * @param {string} params.hora           - 'HH:MM'
 * @param {number} params.calado
 * @param {number} params.folgaSuperior
 * @param {number} params.folgaInferior
 * @param {number} [params.velocidade]   - velocidade média (nós); data cada ponto
 * @param {string} params.token
 * @param {Function} [params.onProgress]
 * @returns {Promise<SimulacaoResultado>}
 */
export async function simularRota({
  routeId,
  data,
  hora,
  calado = 1.0,
  folgaSuperior = 0.2,
  folgaInferior = 0.1,
  velocidade,
  token,
  onProgress = () => {},
}) {
  onProgress('A calcular...');

  const res = await fetch(`${API_BASE}/calcular`, {
    method: 'POST',
    headers: authHeaders(token, { 'Content-Type': 'application/json' }),
    body: JSON.stringify({
      route_id:       routeId,
      data,
      hora,
      calado,
      folga_superior: folgaSuperior,
      folga_inferior: folgaInferior,
      ...(velocidade != null ? { velocidade } : {}),
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new SimulacaoError(err.error ?? 'Não foi possível calcular a simulação.', err);
  }

  const resultado = await res.json();
  onProgress('Simulação concluída');
  return resultado;
}

export class SimulacaoError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name    = 'SimulacaoError';
    this.details = details;
  }
}

/**
 * @typedef {Object} SimulacaoResultado
 * @property {PontoColorido[]} positions
 * @property {string} startDate
 * @property {number} calado
 * @property {number} folgaSup
 * @property {number} folgaInf
 *
 * @typedef {Object} PontoColorido
 * @property {number} lat
 * @property {number} lng
 * @property {number} [z]
 * @property {number} [waterLevel]
 * @property {number} [profReal]
 * @property {number} [folga]
 * @property {'green'|'yellow'|'red'|'black'|'purple'} color
 */
