// Placeholders locais (SVG em data-URI) — não fazem qualquer pedido de rede, ao
// contrário dos antigos assets do Figma. Usados como fallback quando não há foto
// real (rota sem foto da Wikipédia, post sem foto, utilizador sem avatar…).
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

export const IMAGES = {
  routes: {
    caleDoOuro: COVER_PLACEHOLDER,
    rioNovo: COVER_PLACEHOLDER,
    monteFarinha: COVER_PLACEHOLDER,
    mapThumb: COVER_PLACEHOLDER,
    detail: COVER_PLACEHOLDER,
  },
  avatars: {
    me: AVATAR_PLACEHOLDER,
    profile: AVATAR_PLACEHOLDER,
    user1: AVATAR_PLACEHOLDER,
    user2: AVATAR_PLACEHOLDER,
    postUser: AVATAR_PLACEHOLDER,
  },
  posts: {
    profile: COVER_PLACEHOLDER,
    feed1: COVER_PLACEHOLDER,
    feed2: COVER_PLACEHOLDER,
    detail: COVER_PLACEHOLDER,
  },
  boats: {
    default: COVER_PLACEHOLDER,
  },
  icons: {
    notifThumb: AVATAR_PLACEHOLDER,
  },
};
