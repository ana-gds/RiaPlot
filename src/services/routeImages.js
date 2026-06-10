// Procura uma foto representativa para cada rota usando a API da Wikipédia (pt).
// Estratégia: geosearch pelas coordenadas do cais de chegada → foto principal do
// artigo do local mais próximo. Fallback: pesquisa por texto pelo nome do cais.
// Sem chave de API (CORS aberto via origin=*). Resultados em cache no localStorage.

const CACHE_PREFIX = "riaplot:routeimg:";
const WIKI = "https://pt.wikipedia.org/w/api.php";
const memCache = new Map();

function readCache(id) {
  if (memCache.has(id)) return memCache.get(id);
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + id);
    if (raw !== null) {
      const value = raw === "" ? null : raw;
      memCache.set(id, value);
      return value;
    }
  } catch {
    /* localStorage indisponível */
  }
  return undefined; // ainda não procurado
}

function writeCache(id, url) {
  memCache.set(id, url);
  try {
    localStorage.setItem(CACHE_PREFIX + id, url ?? "");
  } catch {
    /* ignora quota/privacidade */
  }
}

function coordOf(route) {
  for (const cais of [route?.cais_chegada, route?.cais_partida]) {
    const lat = Number(cais?.latitude);
    const lon = Number(cais?.longitude);
    if (Number.isFinite(lat) && Number.isFinite(lon)) return { lat, lon };
  }
  return null;
}

async function wikiThumb(params) {
  const url =
    `${WIKI}?action=query&format=json&origin=*` +
    "&prop=pageimages&piprop=thumbnail&pithumbsize=800&" +
    params;
  const res = await fetch(url);
  if (!res.ok) return null;
  const pages = (await res.json())?.query?.pages;
  if (!pages) return null;
  // Ordena pela ordem do gerador (geosearch = mais próximo primeiro).
  const best = Object.values(pages)
    .filter((p) => p.thumbnail?.source)
    .sort((a, b) => (a.index ?? 0) - (b.index ?? 0))[0];
  return best?.thumbnail?.source ?? null;
}

async function geosearchImage({ lat, lon }) {
  return wikiThumb(
    `generator=geosearch&ggsradius=10000&ggslimit=6&ggscoord=${lat}|${lon}`,
  );
}

async function textSearchImage(query) {
  return wikiThumb(
    `generator=search&gsrlimit=1&gsrsearch=${encodeURIComponent(query)}`,
  );
}

/**
 * Devolve o URL de uma foto para a rota, ou null se não encontrar.
 * O resultado (incluindo "não encontrado") fica em cache.
 */
export async function getRouteImage(id, route) {
  const cached = readCache(id);
  if (cached !== undefined) return cached;

  let url = null;
  try {
    const coord = coordOf(route);
    if (coord) url = await geosearchImage(coord);
    if (!url) {
      const place = route?.cais_chegada?.nome ?? route?.nome;
      if (place) url = await textSearchImage(`${place}, Aveiro`);
    }
  } catch {
    /* rede indisponível — devolve null e tenta outra vez noutra sessão */
    return null;
  }

  writeCache(id, url);
  return url;
}
