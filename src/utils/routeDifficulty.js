/**
 * Cálculo da dificuldade de uma rota.
 *
 * A dificuldade não é arbitrária: deriva de dois dados concretos curados a
 * partir do PDF de curadoria das rotas (ver RouteSeeder.php / Route.php):
 *
 *   - calado_max     : calado máximo recomendado em metros. Quanto MAIS BAIXO,
 *                      mais técnica é a rota (passa por sequeiros/canaletes
 *                      pouco profundos e só com barcos de baixo calado).
 *                      O valor sentinela 99 significa "sem restrição".
 *   - condicoes_mare : janela de maré exigida. "estofo" (maré parada) é a mais
 *                      restritiva; "favoravel"/"qualquer" são pouco restritivas.
 *
 * Os dois fatores são pontuados e somados, e o total mapeado para um dos
 * quatro níveis de dificuldade definidos em theme.js (DIFFICULTY).
 */

// Pontuação pelo calado: calado mais baixo => rota mais difícil.
function caladoScore(calado) {
  if (!calado || calado >= 99) return 0; // sem restrição de calado
  if (calado >= 1.0) return 1;
  if (calado >= 0.5) return 2;
  return 3; // <= 0.3 m: só barcos muito baixos
}

// Pontuação pelas condições de maré: janela mais estreita => mais difícil.
function mareScore(condicoes) {
  switch (condicoes) {
    case "estofo":
      return 2; // só na maré parada — janela curta e técnica
    case "mares_vivas":
      return 1;
    case "favoravel":
    case "qualquer":
    default:
      return 0;
  }
}

/**
 * Devolve o nível de dificuldade (1–4) de uma rota.
 * @param {number} calado  calado_max em metros (99 = sem restrição)
 * @param {string} condicoesMare  "qualquer" | "favoravel" | "estofo" | "mares_vivas"
 */
export function routeDifficulty(calado, condicoesMare) {
  const total = caladoScore(calado) + mareScore(condicoesMare);
  if (total <= 1) return 1; // Fácil
  if (total === 2) return 2; // Moderado
  if (total <= 4) return 3; // Difícil
  return 4; // Muito difícil
}

/** Texto explicativo de como a dificuldade é calculada (usado no detalhe da rota). */
export const DIFFICULTY_EXPLANATION =
  "A dificuldade é calculada a partir do calado máximo recomendado " +
  "(rotas que só admitem barcos de baixo calado passam por zonas pouco " +
  "profundas e são mais técnicas) e das condições de maré exigidas " +
  "(a maré de estofo abre uma janela de navegação mais curta).";

/**
 * Compatibilidade da rota com o barco do utilizador.
 *
 * Compara o calado do barco registado com o calado máximo recomendado da rota.
 * Devolve null quando não há barco registado (ou sem calado definido), para a
 * UI poder cair na dificuldade intrínseca sem mostrar nada de personalizado.
 *
 * @param {number} routeCalado  calado_max da rota (99 = sem restrição)
 * @param {number} boatCalado   calado do barco do utilizador, em metros
 * @returns {{status: "ok"|"limite"|"incompativel", message: string}|null}
 */
export function boatCompatibility(routeCalado, boatCalado) {
  const boat = Number(boatCalado);
  if (!boat || boat <= 0) return null; // sem dados do barco

  const boatStr = `${boat} m`;

  // Rota sem restrição de calado: compatível com qualquer barco.
  if (!routeCalado || routeCalado >= 99) {
    return {
      status: "ok",
      message: `O teu barco (calado ${boatStr}) é compatível: esta rota não tem restrição de calado.`,
    };
  }

  const routeStr = `${routeCalado} m`;
  const margin = routeCalado - boat;

  if (margin < 0) {
    return {
      status: "incompativel",
      message: `O calado do teu barco (${boatStr}) excede o calado máximo desta rota (${routeStr}). Não é recomendável fazê-la com esta embarcação.`,
    };
  }
  if (margin < 0.2) {
    return {
      status: "limite",
      message: `O calado do teu barco (${boatStr}) está perto do limite desta rota (máx. ${routeStr}). Navega com atenção à maré.`,
    };
  }
  return {
    status: "ok",
    message: `O teu barco (calado ${boatStr}) é compatível com esta rota (máx. ${routeStr}).`,
  };
}
