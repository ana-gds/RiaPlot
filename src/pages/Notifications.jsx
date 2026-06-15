import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, CommentIcon } from "../components/ui/Icons.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useNotifications } from "../contexts/NotificationsContext.jsx";
import {
  getNotifications,
  markAllNotificationsRead,
  getPost,
} from "../services/api.js";

const ICON_BG = {
  like: "rgba(219,139,49,0.12)",
  comment: "rgba(18,101,135,0.12)",
  follow: "rgba(119,181,211,0.12)",
  save: "rgba(0,77,108,0.12)",
};

const ICONS = {
  like: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#DB8B31">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  ),
  comment: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
        stroke="#126587"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  follow: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
        stroke="#77B5D3"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="8.5" cy="7" r="4" stroke="#77B5D3" strokeWidth="2" />
      <line x1="20" y1="8" x2="20" y2="14" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" />
      <line x1="23" y1="11" x2="17" y2="11" stroke="#77B5D3" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  save: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
      <path
        d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
        stroke="#004D6C"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

function truncate(text, max) {
  if (!text) return "";
  return text.length > max ? `${text.slice(0, max)}…` : text;
}

// Texto da notificação consoante o tipo (a parte a negrito é o username).
function messageFor(n) {
  switch (n.type) {
    case "like":
      return "gostou do teu post";
    case "comment":
      return n.comment ? `comentou: "${truncate(n.comment, 60)}"` : "comentou no teu post";
    case "follow":
      return "começou a seguir-te";
    case "save":
      return "guardou a tua rota";
    default:
      return "";
  }
}

// Bucket temporal (Hoje / Ontem / Esta semana / Mais antigas).
function bucketFor(date, now) {
  const d = new Date(date);
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const startYesterday = new Date(startToday);
  startYesterday.setDate(startYesterday.getDate() - 1);
  const startWeek = new Date(startToday);
  startWeek.setDate(startWeek.getDate() - 7);

  if (d >= startToday) return "Hoje";
  if (d >= startYesterday) return "Ontem";
  if (d >= startWeek) return "Esta semana";
  return "Mais antigas";
}

function relativeTime(date, now) {
  const diffMs = now - new Date(date).getTime();
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return "Agora mesmo";
  if (min < 60) return `Há ${min} minuto${min > 1 ? "s" : ""}`;
  const h = Math.floor(min / 60);
  if (h < 24) return `Há ${h} hora${h > 1 ? "s" : ""}`;
  const days = Math.floor(h / 24);
  if (days < 7) return `Há ${days} dia${days > 1 ? "s" : ""}`;
  return new Date(date).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

const BUCKET_ORDER = ["Hoje", "Ontem", "Esta semana", "Mais antigas"];

// Mapeia o post enriquecido da API para a forma que o PostDetail espera.
function mapPost(p, user) {
  return {
    id: p.id ?? p._id,
    user_id: p.user_id,
    username: p.username ?? "unknown",
    photo_url: p.photo_url ?? null,
    date: p.created_at
      ? new Date(p.created_at).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" })
      : "",
    location: p.location ?? "",
    image: p.post_url?.[0] ?? IMAGES.posts.feed1,
    images: p.post_url ?? [],
    gpxUrl: p.gpx_url ?? null,
    gpxPoints: p.gpx_points ?? null,
    route_doc: p.route_doc ?? "",
    title: p.title,
    description: p.description,
    comments: p.comments ?? [],
    liked: (p.likes ?? []).includes(user?._id ?? user?.id),
    likes: (p.likes ?? []).length,
    commentCount: (p.comments ?? []).length,
  };
}

function NotifItem({ n, onClick }) {
  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") onClick?.();
      }}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-cream/60 ${
        n.read ? "" : "bg-primary/5"
      }`}
    >
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: ICON_BG[n.type] }}
      >
        {ICONS[n.type]}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-[21px] mb-0.5 text-dark">
          <span className="font-semibold">{n.username}</span> {n.message}
        </p>
        <p className="text-xs text-muted-soft">{n.time}</p>
      </div>
      {n.thumb && (
        <div className="w-12 h-12 rounded-[10px] overflow-hidden flex-shrink-0 bg-sand">
          <img src={n.thumb} alt="" className="w-full h-full object-cover" />
        </div>
      )}
    </div>
  );
}

export default function Notifications() {
  const { openSidebar } = useOutletContext();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { clearUnread } = useNotifications();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  // Instante de referência fixo para os tempos relativos (estável no render).
  const [now] = useState(() => Date.now());

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getNotifications(token, { page: 1 })
      .then((res) => {
        if (cancelled) return;
        setNotifications(res.data ?? []);
        setPage(res.current_page ?? 1);
        setLastPage(res.last_page ?? 1);
        // Ao abrir a página, marca tudo como lido: o badge desaparece já e, na
        // próxima visita, estas notificações aparecem com fundo branco. O
        // destaque mantém-se nesta visita (não mexemos no estado local).
        clearUnread();
        markAllNotificationsRead(token).catch(() => {});
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [token, clearUnread]);

  // Carrega a página seguinte e acrescenta à lista.
  const loadMore = async () => {
    if (loadingMore || page >= lastPage) return;
    setLoadingMore(true);
    try {
      const res = await getNotifications(token, { page: page + 1 });
      setNotifications((prev) => [...prev, ...(res.data ?? [])]);
      setPage(res.current_page ?? page + 1);
      setLastPage(res.last_page ?? lastPage);
    } catch {
      // mantém o que já está carregado
    } finally {
      setLoadingMore(false);
    }
  };

  // Agrupa as notificações por bucket temporal, preservando a ordem (mais
  // recentes primeiro, já que a API devolve por created_at desc).
  const sections = useMemo(() => {
    const groups = {};
    for (const n of notifications) {
      const label = bucketFor(n.created_at, now);
      (groups[label] ??= []).push({
        id: n.id,
        type: n.type,
        username: n.username,
        message: messageFor(n),
        time: relativeTime(n.created_at, now),
        thumb: n.thumb ?? null,
        read: n.read,
        post_id: n.post_id ?? null,
      });
    }
    return BUCKET_ORDER.filter((l) => groups[l]?.length).map((l) => ({
      label: l,
      items: groups[l],
    }));
  }, [notifications, now]);

  const handleClick = async (n) => {
    // As notificações já foram marcadas como lidas ao abrir a página; aqui só
    // tratamos da navegação para o post associado (likes/comentários).
    if (n.post_id && (n.type === "like" || n.type === "comment")) {
      try {
        const p = await getPost(token, n.post_id);
        navigate("/social/post", { state: { post: mapPost(p, user) } });
      } catch {
        // post pode ter sido removido — fica apenas marcado como lido
      }
    }
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 flex-shrink-0">
        <CircularButton onClick={openSidebar} ariaLabel="Menu" className="md:hidden">
          <MenuIcon />
        </CircularButton>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-dark leading-tight">Notificações</h1>
          <span className="text-xs text-muted">As tuas atividades recentes</span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto pb-4">
        <div className="w-full md:max-w-2xl md:mx-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <span className="text-sm text-muted">A carregar…</span>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CommentIcon size={48} color="var(--color-muted-soft)" className="mb-3" />
              <p className="text-sm font-semibold text-dark">Sem notificações</p>
              <p className="text-xs mt-1 text-muted">
                Quando alguém gostar, comentar ou te seguir, aparece aqui.
              </p>
            </div>
          ) : (
            sections.map((s) => (
              <section key={s.label}>
                <div className="px-4 pt-4 pb-2">
                  <span className="text-xs font-semibold uppercase tracking-[0.3px] text-muted-soft">
                    {s.label}
                  </span>
                </div>
                {s.items.map((n) => (
                  <NotifItem key={n.id} n={n} onClick={() => handleClick(n)} />
                ))}
              </section>
            ))
          )}

          {!loading && page < lastPage && (
            <div className="flex justify-center mt-4 mb-2">
              <button
                type="button"
                onClick={loadMore}
                disabled={loadingMore}
                className="h-11 px-6 rounded-2xl bg-primary text-white text-sm font-semibold shadow-primary-button active:scale-95 disabled:opacity-60"
              >
                {loadingMore ? "A carregar…" : "Carregar mais"}
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
