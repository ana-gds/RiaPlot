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

// Ajuste pela maré atual (altura ao Zero Hidrográfico, da previsão FCUL/IH).
// Mais água => mais profundidade sobre os sequeiros => mais fácil; e vice-versa.
// Devolve 0 quando não há maré disponível (recai na dificuldade intrínseca).
function tideModifier(tide) {
  if (!tide || typeof tide.height !== "number") return 0;
  if (tide.height >= 3.0) return -1; // águas altas (perto da preia-mar): mais fácil
  if (tide.height <= 1.3) return 1; // baixa-mar: menos água, mais difícil
  return 0;
}

/**
 * Devolve o nível de dificuldade (1–4) de uma rota.
 *
 * Com `tide` (resposta de /tides/current), a dificuldade reflete a maré em
 * tempo real: a mesma rota fica mais fácil em águas altas e mais difícil em
 * baixa-mar. Sem `tide`, devolve a dificuldade intrínseca (retrocompatível).
 *
 * @param {number} calado  calado_max em metros (99 = sem restrição)
 * @param {string} condicoesMare  "qualquer" | "favoravel" | "estofo" | "mares_vivas"
 * @param {{height:number}|null} [tide]  maré atual no porto
 */
export function routeDifficulty(calado, condicoesMare, tide = null) {
  const total = Math.max(
    0,
    caladoScore(calado) + mareScore(condicoesMare) + tideModifier(tide),
  );
  if (total <= 1) return 1; // Fácil
  if (total === 2) return 2; // Moderado
  if (total <= 4) return 3; // Difícil
  return 4; // Muito difícil
}

/** Texto explicativo de como a dificuldade é calculada (usado no detalhe da rota). */
export const DIFFICULTY_EXPLANATION =
  "A dificuldade combina três fatores: o calado máximo recomendado (rotas que " +
  "só admitem barcos de baixo calado passam por zonas pouco profundas e são " +
  "mais técnicas), as condições de maré exigidas (a maré de estofo abre uma " +
  "janela mais curta) e a maré atual em tempo real (a mesma rota fica mais " +
  "fácil em águas altas e mais difícil em baixa-mar).";

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

// Nível médio da maré em Aveiro (≈ MSL acima do Zero Hidrográfico), usado como
// referência: assume-se que o calado_max curado corresponde a este nível, e a
// maré atual aumenta/diminui a profundidade disponível sobre os sequeiros.
// Valor aproximado e afinável; a maré em Aveiro varia ~0,6 m (BM) a ~3,6 m (PM).
const REF_TIDE_AVEIRO = 2.0;

/**
 * Navegabilidade "agora": estima se o barco do utilizador passa na rota com a
 * maré atual (vinda de GET /tides/current).
 *
 * Modelo: calado_navegável(agora) ≈ calado_max + (maré_atual − maré_referência).
 * Em águas altas há mais profundidade sobre os sequeiros (mais calado admissível);
 * na baixa-mar, menos. A margem para o calado do barco define o veredito.
 *
 * Importante: é uma ESTIMATIVA. A maré usada é a do porto/barra de Aveiro; não
 * modela o desfasamento nem a batimetria fina dentro dos esteiros. Por isso o
 * texto deve ser apresentado como orientação, não como garantia.
 *
 * @param {object} route  rota (usa calado_max e condicoes_mare)
 * @param {number} boatCalado  calado do barco do utilizador
 * @param {object|null} tide  resposta de /tides/current: { height, rising, next: {label, time, height} }
 * @returns {{status: "ok"|"limite"|"incompativel", title: string, message: string, tide: string}|null}
 */
export function navigabilityNow(route, boatCalado, tide) {
  if (!tide || typeof tide.height !== "number") return null;

  // Contexto da maré, sempre presente.
  const trend = tide.rising ? "a subir" : "a descer";
  let tideLine = `Maré ${tide.height} m, ${trend}.`;
  if (tide.next) {
    tideLine += ` Próxima ${tide.next.label.toLowerCase()} às ${tide.next.time} (${tide.next.height} m).`;
  }

  // Rotas que exigem estofo: a janela ótima é junto à maré parada (próximo extremo).
  const estofo = route?.condicoes_mare === "estofo";
  const estofoHint = estofo
    ? " Como pede maré de estofo, parte de modo a passar as zonas críticas perto da maré parada."
    : "";

  const boat = Number(boatCalado);

  // Sem barco registado: só damos o contexto da maré.
  if (!boat || boat <= 0) {
    return {
      status: "ok",
      title: "Maré agora",
      message: estofo
        ? "Esta rota pede maré de estofo — a melhor janela é perto da próxima preia ou baixa-mar."
        : "Regista o teu barco para veres se a rota é navegável agora para a tua embarcação.",
      tide: tideLine,
    };
  }

  const routeCalado = route?.calado_max;
  const boatStr = `${boat} m`;

  // Rota sem restrição de calado: navegável independentemente da maré.
  if (!routeCalado || routeCalado >= 99) {
    return {
      status: "ok",
      title: "Navegável agora",
      message: `Esta rota não tem restrição de calado — navegável com a tua embarcação (${boatStr}).`,
      tide: tideLine,
    };
  }

  // Calado navegável estimado com a maré atual.
  const navigableDraught = routeCalado + (tide.height - REF_TIDE_AVEIRO);
  const margin = navigableDraught - boat;
  const navStr = `${navigableDraught.toFixed(1)} m`;

  if (margin < 0) {
    // Sugere esperar pela próxima preia-mar quando a maré está a subir.
    const wait =
      tide.rising && tide.next?.type === "PM"
        ? ` Com a maré a subir, ganha profundidade até à preia-mar das ${tide.next.time} (${tide.next.height} m).`
        : "";
    return {
      status: "incompativel",
      title: "Não navegável agora",
      message: `Com a maré atual, o calado navegável estimado é ~${navStr}, abaixo do teu barco (${boatStr}).${wait}`,
      tide: tideLine,
    };
  }

  if (margin < 0.2) {
    return {
      status: "limite",
      title: tide.rising ? "Navegável no limite — maré a subir" : "Navegável no limite — maré a descer",
      message: `Com a maré atual ficas no limite: calado navegável estimado ~${navStr} vs ${boatStr} do teu barco.${estofoHint}`,
      tide: tideLine,
    };
  }

  return {
    status: "ok",
    title: "Navegável agora",
    message: `Com a maré atual passas com folga: calado navegável estimado ~${navStr} (o teu barco tem ${boatStr}).${estofoHint}`,
    tide: tideLine,
  };
}
