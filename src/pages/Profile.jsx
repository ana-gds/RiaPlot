import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { caisImage } from "../constants/caisImages.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { FeedPostCard } from "../components/shared/PostCard.jsx";
import { RouteCard } from "../components/shared/RouteCard.jsx";
import { UserListModal } from "../components/shared/UserListModal.jsx";
import { SearchBar } from "../components/shared/SearchBar.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useRoutes } from "../hooks/useApi.js";
import { getPosts, saveRoute, getFollowers, getFollowing, getCurrentTide } from "../services/api.js";
import { routeDifficulty } from "../utils/routeDifficulty.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

function extractId(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw.$oid ?? String(raw);
  return raw;
}

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "rotas", label: "Rotas" },
];

// Ordenação das rotas guardadas (seleção única).
const SAVED_SORTS = [
  {
    key: "nome",
    label: "Nome",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 4v15m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M13 6h7M13 11h5M13 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "dificuldade",
    label: "Dificuldade",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 20V10M12 20V4M18 20v-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    key: "distancia",
    label: "Distância",
    icon: (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M3 12h18M3 12l3-3M3 12l3 3M21 12l-3-3M21 12l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function StatItem({ value, label, onClick }) {
  const content = (
    <>
      <span className="text-lg font-bold text-dark">{value}</span>
      <span className="text-xs text-dark/70">{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="flex flex-col items-center gap-0.5 active:scale-95 transition-transform"
      >
        {content}
      </button>
    );
  }
  return <div className="flex flex-col items-center gap-0.5">{content}</div>;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const apiRoutes = useRoutes();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [savedIds, setSavedIds] = useState(() => user?.saved_routes ?? []);
  const [savedSearch, setSavedSearch] = useState("");
  const [savedSort, setSavedSort] = useState("nome");
  const [tide, setTide] = useState(null);
  // Modal de seguidores / a seguir
  const [listModal, setListModal] = useState(null); // "followers" | "following" | null
  const [listUsers, setListUsers] = useState([]);
  const [listLoading, setListLoading] = useState(false);

  const openList = async (type) => {
    const myId = user?._id ?? user?.id;
    if (!myId) return;
    setListModal(type);
    setListUsers([]);
    setListLoading(true);
    try {
      const data =
        type === "followers"
          ? await getFollowers(token, myId)
          : await getFollowing(token, myId);
      setListUsers(Array.isArray(data) ? data : []);
    } catch {
      setListUsers([]);
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    setSavedIds(user?.saved_routes ?? []);
  }, [user]);

  // Maré atual no porto de Aveiro, para ajustar a dificuldade em tempo real.
  useEffect(() => {
    let cancelled = false;
    getCurrentTide("aveiro")
      .then((data) => {
        if (!cancelled) setTide(data);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Posts do próprio utilizador (filtrados pelo servidor via ?user=).
  useEffect(() => {
    if (!token) return;
    const myId = user?._id ?? user?.id;
    let cancelled = false;
    getPosts(token, { userId: myId, perPage: 50 })
      .then((res) => {
        if (cancelled) return;
        setPosts(
          (res.data ?? [])
            .map((p) => ({
              id: p.id ?? p._id,
              user_id: p.user_id,
              username: p.username ?? user?.username ?? "",
              avatar: p.photo_url ?? user?.photo_url ?? null,
              photo_url: p.photo_url ?? user?.photo_url ?? null,
              date: formatDate(p.created_at),
              location: p.location ?? "",
              image: p.post_url?.[0] ?? IMAGES.posts.feed1,
              images: p.post_url ?? [],
              gpxUrl: p.gpx_url ?? null,
              gpxPoints: p.gpx_points ?? null,
              route_doc: p.route_doc ?? "",
              title: p.title,
              description: p.description,
              comments: p.comments ?? [],
              liked: (p.likes ?? []).includes(myId),
              likes: (p.likes ?? []).length,
              commentCount: (p.comments ?? []).length,
            })),
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, user]);

  // Rotas realmente guardadas pelo utilizador (saved_routes vem do servidor).
  // A foto é a do cais de partida e a dificuldade é a real (com maré), tal como
  // na página de Rotas.
  const savedRoutes = useMemo(() => {
    if (savedIds.length === 0) return [];
    return apiRoutes
      .filter((r) => savedIds.includes(extractId(r._id ?? r.id)))
      .map((r) => {
        const id = extractId(r._id ?? r.id);
        return {
          id,
          title: r.nome ?? "Rota",
          route: [r.cais_partida?.nome, r.cais_chegada?.nome].filter(Boolean).join(" → ") || "",
          image: caisImage(r.cais_partida?.nome) || IMAGES.routes.detail,
          difficulty: routeDifficulty(r.calado_max, r.condicoes_mare, tide),
          distance: r.distancia_nm ?? null,
          saved: true,
        };
      });
  }, [apiRoutes, savedIds, tide]);

  // Pesquisa + ordenação sobre as rotas guardadas (no cliente).
  const visibleSavedRoutes = useMemo(() => {
    const q = savedSearch.trim().toLowerCase();
    const list = savedRoutes.filter(
      (r) => !q || r.title.toLowerCase().includes(q) || r.route.toLowerCase().includes(q),
    );
    const sorted = [...list];
    if (savedSort === "nome") {
      sorted.sort((a, b) => a.title.localeCompare(b.title, "pt", { sensitivity: "base" }));
    } else if (savedSort === "dificuldade") {
      sorted.sort((a, b) => a.difficulty - b.difficulty);
    } else if (savedSort === "distancia") {
      sorted.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
    }
    return sorted;
  }, [savedRoutes, savedSearch, savedSort]);

  const toggleSave = async (id) => {
    setSavedIds((prev) => prev.filter((x) => x !== id));
    try {
      const res = await saveRoute(token, id);
      if (res?.saved_routes) updateUser({ saved_routes: res.saved_routes });
    } catch {
      setSavedIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    }
  };

  const toggleLike = (id) =>
    setPosts((p) =>
      p.map((x) =>
        x.id === id ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 } : x,
      ),
    );

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton onClick={() => navigate("/routes")} />
      </div>

      <div className="flex flex-col items-center px-4 gap-1">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[3px] border-primary shadow-[0_4px_16px_rgba(219,139,49,0.3)]">
          {user?.photo_url ? (
            <img src={user.photo_url} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-soft text-white text-3xl font-bold">
              {user?.name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold mt-3 text-dark">{user?.name ?? ""}</h1>
        <p className="text-[11px] text-dark/60">@{user?.username ?? ""}</p>
        <div className="flex items-center gap-12 mt-3 mb-4">
          <StatItem value={posts.length} label="Posts" />
          <StatItem
            value={user?.followers?.length ?? 0}
            label="Seguidores"
            onClick={() => openList("followers")}
          />
          <StatItem
            value={user?.following?.length ?? 0}
            label="Seguindo"
            onClick={() => openList("following")}
          />
        </div>
        <button
          type="button"
          onClick={() => navigate("/profile/edit")}
          className="px-6 py-2.5 rounded-2xl bg-primary-soft text-white text-[15px] font-semibold shadow-primary-button active:scale-95 mb-2"
          style={{ width: 138 }}
        >
          Editar perfil
        </button>
      </div>

      <div className="relative flex mt-4 border-b border-divider/70">
        {TABS.map((t) => {
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => setActiveTab(t.key)}
              className={`flex-1 py-2.5 text-sm transition-colors ${
                isActive ? "text-dark font-semibold" : "text-muted-soft"
              }`}
            >
              {t.label}
            </button>
          );
        })}
        <span
          className="absolute bottom-0 h-[2px] w-12 -translate-x-1/2 rounded-full bg-primary transition-all duration-200"
          style={{ left: activeTab === "posts" ? "25%" : "75%" }}
        />
      </div>

      <div className="py-4">
        {activeTab === "posts" &&
          (posts.length > 0 ? (
            <div className="flex flex-col gap-4 md:max-w-xl md:mx-auto">
              {posts.map((p) => (
                <FeedPostCard
                  key={p.id}
                  post={p}
                  onToggleLike={toggleLike}
                  onOpenComments={() => navigate("/social/post", { state: { post: p } })}
                  onOpenDetail={() => navigate("/social/post", { state: { post: p } })}
                  onOpenProfile={(uid) => navigate(`/users/${uid}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 px-4 text-muted">
              <p className="text-sm font-medium">Ainda não publicaste nada</p>
              <p className="text-xs mt-1">Partilha a tua primeira aventura na página Social</p>
            </div>
          ))}
        {activeTab === "rotas" &&
          (savedRoutes.length > 0 ? (
            <div className="px-4">
              <div className="flex flex-col gap-3 mb-4">
                <SearchBar
                  value={savedSearch}
                  onChange={setSavedSearch}
                  onClear={() => setSavedSearch("")}
                  placeholder="Procura nos guardados..."
                />
                <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pb-1 scroll-x-hidden">
                  {SAVED_SORTS.map((s) => (
                    <Chip
                      key={s.key}
                      active={savedSort === s.key}
                      onClick={() => setSavedSort(s.key)}
                      icon={s.icon}
                    >
                      {s.label}
                    </Chip>
                  ))}
                </div>
              </div>
              {visibleSavedRoutes.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {visibleSavedRoutes.map((r) => (
                    <RouteCard
                      key={r.id}
                      route={r}
                      onToggleSave={toggleSave}
                      onClick={() => navigate(`/routes/${r.id}`)}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted">
                  <p className="text-sm font-medium">Nenhuma rota encontrada</p>
                  <p className="text-xs mt-1">Tenta ajustar a pesquisa</p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 px-4 text-muted">
              <p className="text-sm font-medium">Ainda não guardaste rotas</p>
              <p className="text-xs mt-1">Toca no marcador de uma rota para a guardar aqui</p>
            </div>
          ))}
      </div>

      <UserListModal
        open={!!listModal}
        title={listModal === "followers" ? "Seguidores" : "A seguir"}
        users={listUsers}
        loading={listLoading}
        onClose={() => setListModal(null)}
        onSelect={(u) => {
          setListModal(null);
          navigate(`/users/${u.id}`);
        }}
      />
    </>
  );
}
