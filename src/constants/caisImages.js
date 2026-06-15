// Fotos reais dos cais da Ria de Aveiro (src/assets/cais/), associadas às rotas
// pelo cais de partida. Substituem as antigas fotos genéricas da Wikipédia.
// Quando o cais de partida de uma rota não tem foto correspondente, a rota fica
// sem foto e recai no placeholder local (ver Routes.jsx / RouteDetail.jsx).
//
// Para acrescentar um cais: põe o ficheiro em src/assets/cais/ e adiciona a
// linha `"<nome do cais_partida>": "<ficheiro>"` ao mapa abaixo. O Vite trata de
// empacotar a imagem (import.meta.glob).

// O Vite resolve cada ficheiro para o seu URL final no bundle.
const modules = import.meta.glob("../assets/cais/*", {
  eager: true,
  import: "default",
  query: "?url",
});

// URL final indexado pelo nome do ficheiro (ex.: "ANGE.jpeg").
const urlByFile = {};
for (const path in modules) {
  const file = path.split("/").pop();
  urlByFile[file] = modules[path];
}

// Nome exato do cais de partida (como vem da BD) → ficheiro da foto.
// Cais sem foto representativa ficam de fora de propósito.
const FILE_BY_CAIS = {
  ANGE: "ANGE.jpeg",
  APARA: "apara.jpeg",
  Bico: "cais_bico.jpeg",
  "Boca da Marinha": "boca_marinha.jpeg",
  Carregal: "carregal.jpg",
  "Cais do Moliço": "cais_Molico.jpeg",
  "Costa Nova": "marina_costanova.jpeg",
  Esgueira: "esgueira.jpg",
  "Ilha dos Ovos": "ilha-dos-ovos.jpg",
  // Cais de partida da rota Moacha "Cale do Ouro e Cale do Amoroso".
  "Ilha dos Ovos (Norte)": "cale-do-ouro.jpg",
  "Jardim Oudinot": "Jardim_Oudinot.jpeg",
  Lavacos: "lavacos.webp",
  Lota: "lota_antiga.jpeg",
  "Marégrafo da Barra": "barra_entrada.jpeg",
  "Parque da Vagueira": "cais_vagueira.jpg",
  Parrachil: "parrachil.webp",
  "Ponte da Varela": "ponte_varela.jpeg",
  Puxadouro: "puxadouro.jpg",
  "Quinta da Tojeira": "quinta_tojeira.jpeg",
  "Ribeira Mourão": "RibeiraMourao.jpg",
  "Ribeira da Aldeia": "ribeira_aldeia.jpg",
  "Ribeira da tabuada": "ribeira_tabuadas.png",
  "Ribeira das Bulhas": "cais_bulhas.jpeg",
  "Ribeira das Teixugueiras": "ribeira_teixugueiras.png",
  "Ribeira de Ovar": "cais_ribeira_ovar.png",
  "Ribeira de Pardelhas": "ribeira_pardelhas.jpeg",
  "Ribeira do Manchão": "ribeira_manchao.png",
  "Ribeiro do Gago": "ribeiro_gago.jpeg",
  "Rio Novo do Príncipe": "rio_novo_principe.jpg",
  Salreu: "salreu.jpg",
  "São Jacinto": "sjacinto.jpeg",
  "Terminal Norte": "terminalnorte.jpeg",
  "Terminal Sul": "terminal_sul.jpeg",
  Tijosa: "cais_tijosa.jpeg",
  Tojeira: "tojeira.png",
  Torreira: "cais_torreira2.jpg",
  Vagueira: "cais_vagueira.jpg",
  Varela: "PontedaVarela.jpg",
  // Entroncamentos (PDJ) cujo nome refere um cais com foto representativa.
  "PDJ Bestida (via moranzel)": "cais_bestida.jpeg",
  "PDJ ET Gafanha de Aquém": "cais_gafanha_aquem.jpg",
  "PDJ Costa Nova e ANGE": "marina_costanova.jpeg",
};

// Normaliza o nome (minúsculas, sem acentos, sem pontuação) para tolerar
// pequenas variações de grafia entre a BD e o mapa acima.
const normalize = (s) =>
  s
    ?.normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim() ?? "";

const URL_BY_CAIS = {};
for (const [nome, file] of Object.entries(FILE_BY_CAIS)) {
  const url = urlByFile[file];
  if (url) URL_BY_CAIS[normalize(nome)] = url;
}

/**
 * Foto do cais de partida de uma rota, ou null se não houver foto associada.
 * @param {string|undefined} caisNome  Nome do cais de partida (route.cais_partida.nome)
 */
export function caisImage(caisNome) {
  if (!caisNome) return null;
  return URL_BY_CAIS[normalize(caisNome)] ?? null;
}
