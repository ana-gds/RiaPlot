import { IMAGES } from "./images.js";

export const MOCK_ROUTES = [
  { id: 1, title: "Cale do Ouro", route: "ANGE → Cale do Ouro", image: IMAGES.routes.caleDoOuro, difficulty: 1, saved: false },
  { id: 2, title: "Rio Novo do Príncipe", route: "Rio Novo do Príncipe → Bico", image: IMAGES.routes.rioNovo, difficulty: 1, saved: false },
  { id: 3, title: "Monte Farinha", route: "S. Jacinto → Monte Farinha", image: IMAGES.routes.monteFarinha, difficulty: 2, saved: false },
];

export const MOCK_PROFILE_POSTS = [
  {
    id: 1,
    title: "Manhã de passeio na ria",
    description: "O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota...",
    image: IMAGES.posts.profile,
    likes: 47,
    comments: 8,
    liked: false,
  },
];

export const MOCK_PROFILE_ROUTES = [
  {
    id: 1,
    name: "Rota Canal Central",
    distance: "12.4 km",
    duration: "~2h30",
    description: "Percurso pelo canal central de Aveiro. Ideal para embarcações com calado até 1.2m.",
  },
];

export const MOCK_SOCIAL_POSTS = [
  {
    id: 1,
    username: "marilia_lucia",
    avatar: IMAGES.avatars.user1,
    date: "07/04",
    location: "Costa Nova",
    image: IMAGES.posts.feed1,
    title: "Manhã de passeio na ria",
    description: "O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota...",
    liked: true,
    saved: false,
  },
  {
    id: 2,
    username: "lourencosoares",
    avatar: IMAGES.avatars.user2,
    date: "05/04",
    location: "Ilha do Monte Farinha",
    image: IMAGES.posts.feed2,
    title: "Manhã de passeio na ria",
    description: "O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota...",
    liked: false,
    saved: false,
    route: { distance: "5.5nm", duration: "1h 20m" },
  },
];

export const MOCK_NOTIFICATIONS = [
  {
    label: "Hoje",
    items: [
      { id: 1, type: "like", username: "marilia_lucia", message: "gostou do teu post", time: "Há 5 minutos", thumb: IMAGES.icons.notifThumb, read: false },
      { id: 2, type: "comment", username: "lourencosoares", message: "comentou: 'Que vista incrível! 🌊'", time: "Há 12 minutos", thumb: IMAGES.icons.notifThumb, read: false },
      { id: 3, type: "follow", username: "ana_ribeiro", message: "começou a seguir-te", time: "Há 1 hora", read: false },
      { id: 4, type: "save", username: "joao_costa", message: "guardou a sua rota", time: "Há 2 horas", read: true },
    ],
  },
  {
    label: "Ontem",
    items: [
      { id: 5, type: "like", username: "pedro_santos", message: "gostou do teu post", time: "Ontem às 18:30", thumb: IMAGES.icons.notifThumb, read: true },
      { id: 6, type: "comment", username: "sofia_lopes", message: "comentou no teu post", time: "Ontem às 15:20", thumb: IMAGES.icons.notifThumb, read: true },
      { id: 7, type: "like", username: "tiago_ferreira", message: "gostou do teu post", time: "Ontem às 12:45", read: true },
    ],
  },
  {
    label: "Esta semana",
    items: [
      { id: 8, type: "follow", username: "catarina_alves", message: "começou a seguir-te", time: "Há 2 dias", read: true },
      { id: 9, type: "save", username: "ricardo_silva", message: "guardou a sua rota 'Monte Farinha'", time: "Há 3 dias", read: true },
      { id: 10, type: "comment", username: "ines_oliveira", message: "comentou: 'Adoro esta zona da ria!'", time: "Há 4 dias", thumb: IMAGES.icons.notifThumb, read: true },
    ],
  },
];

export const MOCK_POST_COMMENTS = [
  { id: 1, username: "lourencosoares", avatar: IMAGES.avatars.user2, date: "07/04", text: "Que fotos incríveis! Também adoro esta zona da Costa Nova." },
  { id: 2, username: "anacarol1na", avatar: null, date: "07/04", text: "Concordo! É um dos meus lugares favoritos para remar." },
];

export const REGISTRATION_STEPS = [
  { label: "Dados pessoais", key: 1 },
  { label: "Embarcação", key: 2 },
  { label: "Concluir", key: 3 },
];

export const NAV_ITEMS = [
  {
    key: "rotas",
    label: "Rotas",
    path: "/routes",
    d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1",
  },
  {
    key: "mapa",
    label: "Mapa",
    path: "/routes",
    d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.553 2.776A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7",
  },
  {
    key: "social",
    label: "Social",
    path: "/social",
    d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
  },
  {
    key: "notificacoes",
    label: "Notificações",
    path: "/notifications",
    d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9",
  },
];
