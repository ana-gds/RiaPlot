// Placeholders locais (SVG em data-URI) — não fazem qualquer pedido de rede.
// Usados como fallback quando não há foto real (rota sem foto do cais, post sem
// foto, utilizador sem avatar…).
const svg = (markup) => `data:image/svg+xml,${encodeURIComponent(markup)}`;

const COVER_PLACEHOLDER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#f8ecdd"/><stop offset="1" stop-color="#e9b277"/>` +
    `</linearGradient></defs>` +
    `<rect width="400" height="300" fill="url(#g)"/>` +
    `<path d="M0 210 Q100 180 200 210 T400 210 V300 H0Z" fill="#ffffff" opacity="0.28"/>` +
    `<path d="M0 232 Q100 202 200 232 T400 232 V300 H0Z" fill="#ffffff" opacity="0.22"/>` +
    `</svg>`,
);

const AVATAR_PLACEHOLDER = svg(
  `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">` +
    `<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">` +
    `<stop offset="0" stop-color="#DB8B31"/><stop offset="1" stop-color="#004D6C"/>` +
    `</linearGradient></defs>` +
    `<rect width="100" height="100" fill="url(#g)"/>` +
    `</svg>`,
);

// Apenas as chaves efetivamente usadas na app (ver usos de `IMAGES.*`).
export const IMAGES = {
  routes: { detail: COVER_PLACEHOLDER },
  avatars: { me: AVATAR_PLACEHOLDER },
  posts: { feed1: COVER_PLACEHOLDER, detail: COVER_PLACEHOLDER },
  boats: { default: COVER_PLACEHOLDER },
};
