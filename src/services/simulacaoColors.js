/**
 * simulacaoColors.js
 *
 * Utilitários de cor para desenhar a rota colorida no mapa.
 *
 * As cores seguem a especificação do Roadmap (Fase 5.4):
 *   🟢 Verde  : folga > folgaSuperior  (zona segura)
 *   🟡 Amarelo: folgaInf < folga ≤ folgaSup (atenção)
 *   🔴 Vermelho: folga ≤ folgaInferior  (vai encalhar)
 *   ⚫ Preto  : profundidadeReal ≤ 0   (sequeiro / baixio)
 *   🟣 Roxo   : sem dados de simulação (rota não simulada)
 */

// ---------------------------------------------------------------------------
// Mapa de cores
// ---------------------------------------------------------------------------

export const CORES = {
  green:  '#2ECC71',  // seguro
  yellow: '#F39C12',  // atenção
  red:    '#E74C3C',  // encalha
  black:  '#2C3E50',  // sequeiro
  purple: '#9B59B6',  // sem dados
};

export const LABELS = {
  green:  'Seguro',
  yellow: 'Atenção',
  red:    'Encalhe provável',
  black:  'Sequeiro / Baixio',
  purple: 'Sem dados',
};

// ---------------------------------------------------------------------------
// Agrupamento de pontos em segmentos de cor contígua
// ---------------------------------------------------------------------------

/**
 * Converte um array de pontos coloridos em segmentos contíguos da mesma cor.
 * Em vez de uma Polyline por ponto (600+ elementos), cria apenas tantas
 * Polylines quantas as mudanças de cor — muito mais eficiente no mapa.
 *
 * @param {import('./simulacaoService').PontoColorido[]} pontos
 * @returns {Segmento[]}
 *
 * @example
 * const segmentos = agruparSegmentos(resultado.positions);
 * segmentos.forEach(({ positions, color }) => (
 *   <Polyline positions={positions} color={CORES[color]} weight={4} />
 * ));
 */
export function agruparSegmentos(pontos) {
  if (!pontos || pontos.length === 0) return [];

  const segmentos = [];
  let segmentoActual = {
    color:     pontos[0].color,
    positions: [[pontos[0].lat, pontos[0].lng]],
  };

  for (let i = 1; i < pontos.length; i++) {
    const ponto = pontos[i];
    const latLng = [ponto.lat, ponto.lng];

    if (ponto.color === segmentoActual.color) {
      // Mesmo segmento — adiciona o ponto
      segmentoActual.positions.push(latLng);
    } else {
      // Mudança de cor — fecha o segmento actual e abre novo
      // Inclui o ponto actual no segmento anterior para não haver lacunas
      segmentoActual.positions.push(latLng);
      segmentos.push(segmentoActual);

      segmentoActual = {
        color:     ponto.color,
        positions: [latLng],
      };
    }
  }

  // Fecha o último segmento
  if (segmentoActual.positions.length > 0) {
    segmentos.push(segmentoActual);
  }

  return segmentos;
}

// ---------------------------------------------------------------------------
// Rota sem simulação — cor neutra
// ---------------------------------------------------------------------------

/**
 * Converte trackpoints simples (sem simulação) num único segmento roxo.
 * Usado quando a rota ainda não foi simulada.
 *
 * @param {Array<{lat: number, lng: number}>} trackpoints
 * @returns {Segmento[]}
 */
export function segmentoSemSimulacao(trackpoints) {
  if (!trackpoints || trackpoints.length === 0) return [];

  return [{
    color:     'purple',
    positions: trackpoints.map((p) => [p.lat, p.lng]),
  }];
}

// ---------------------------------------------------------------------------
// Estatísticas da simulação (para o painel lateral)
// ---------------------------------------------------------------------------

/**
 * Calcula percentagens de cada cor na rota.
 *
 * @param {import('./simulacaoService').PontoColorido[]} pontos
 * @returns {{ green: number, yellow: number, red: number, black: number }}
 */
export function calcularEstatisticas(pontos) {
  if (!pontos || pontos.length === 0) {
    return { green: 0, yellow: 0, red: 0, black: 0 };
  }

  const contagem = { green: 0, yellow: 0, red: 0, black: 0 };

  pontos.forEach((p) => {
    if (contagem[p.color] !== undefined) {
      contagem[p.color]++;
    }
  });

  const total = pontos.length;

  return {
    green:  Math.round((contagem.green  / total) * 100),
    yellow: Math.round((contagem.yellow / total) * 100),
    red:    Math.round((contagem.red    / total) * 100),
    black:  Math.round((contagem.black  / total) * 100),
  };
}

// ---------------------------------------------------------------------------
// Determinar se a rota é navegável
// ---------------------------------------------------------------------------

/**
 * Devolve true se a rota não tem nenhum ponto vermelho nem preto.
 *
 * @param {import('./simulacaoService').PontoColorido[]} pontos
 * @returns {boolean}
 */
export function rotaNavegavel(pontos) {
  if (!pontos || pontos.length === 0) return false;
  return !pontos.some((p) => p.color === 'red' || p.color === 'black');
}

// ---------------------------------------------------------------------------
// JSDoc types
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} Segmento
 * @property {'green'|'yellow'|'red'|'black'|'purple'} color
 * @property {[number, number][]} positions  - array de [lat, lng]
 */
