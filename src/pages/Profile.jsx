import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { ProfilePostCard } from "../components/shared/PostCard.jsx";
import { RouteCard } from "../components/shared/RouteCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useRoutes } from "../hooks/useApi.js";
import { getPosts, saveRoute } from "../services/api.js";
import { getRouteImage } from "../services/routeImages.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

function extractId(raw) {
  if (!raw) return null;
  if (typeof raw === "object") return raw.$oid ?? String(raw);
  return raw;
}

function calaoDifficulty(calado) {
  if (!calado || calado <= 0.5) return 1;
  if (calado <= 1.0) return 2;
  return 3;
}

const ROUTE_IMAGES = [
  IMAGES.routes.caleDoOuro,
  IMAGES.routes.rioNovo,
  IMAGES.routes.monteFarinha,
];

const TABS = [
  { key: "posts", label: "Posts" },
  { key: "rotas", label: "Rotas" },
];

function StatItem({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-dark">{value}</span>
      <span className="text-xs text-dark/70">{label}</span>
    </div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const apiRoutes = useRoutes();
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState([]);
  const [savedIds, setSavedIds] = useState(() => user?.saved_routes ?? []);
  const [imagesById, setImagesById] = useState({});

  useEffect(() => {
    setSavedIds(user?.saved_routes ?? []);
  }, [user]);

  // Posts do próprio utilizador (o feed devolve todos; filtramos pelo user_id).
  useEffect(() => {
    if (!token) return;
    const myId = user?._id ?? user?.id;
    let cancelled = false;
    getPosts(token)
      .then((data) => {
        if (cancelled) return;
        setPosts(
          data
            .filter((p) => p.user_id === myId)
            .map((p) => ({
              id: p.id ?? p._id,
              username: p.username ?? user?.username ?? "",
              date: formatDate(p.created_at),
              location: p.location ?? "",
              image: p.post_url?.[0] ?? IMAGES.posts.feed1,
              images: p.post_url ?? [],
              gpxUrl: p.gpx_url ?? null,
              gpxPoints: p.gpx_points ?? null,
              title: p.title,
              description: p.description,
              liked: (p.likes ?? []).includes(myId),
              likes: (p.likes ?? []).length,
              comments: (p.comments ?? []).length,
            })),
        );
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, user]);

  // Vai buscar uma foto real do local para cada rota guardada (igual à página de rotas)
  useEffect(() => {
    let cancelled = false;
    apiRoutes.forEach((r) => {
      const id = extractId(r._id ?? r.id);
      if (!id || !savedIds.includes(id)) return;
      getRouteImage(id, r).then((url) => {
        if (!cancelled && url) setImagesById((prev) => ({ ...prev, [id]: url }));
      });
    });
    return () => { cancelled = true; };
  }, [apiRoutes, savedIds]);

  // Rotas realmente guardadas pelo utilizador (saved_routes vem do servidor)
  const savedRoutes = useMemo(() => {
    if (savedIds.length === 0) return [];
    return apiRoutes
      .filter((r) => savedIds.includes(extractId(r._id ?? r.id)))
      .map((r, i) => {
        const id = extractId(r._id ?? r.id);
        return {
          id,
          title: r.nome ?? "Rota",
          route: [r.cais_partida?.nome, r.cais_chegada?.nome].filter(Boolean).join(" → ") || "",
          image: imagesById[id] ?? ROUTE_IMAGES[i % ROUTE_IMAGES.length],
          difficulty: calaoDifficulty(r.calado_max),
          saved: true,
        };
      });
  }, [apiRoutes, savedIds, imagesById]);

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
        <h1 className="text-xl font-bold mt-3 text-dark font-inter">{user?.name ?? ""}</h1>
        <p className="text-[11px] text-dark/60">@{user?.username ?? ""}</p>
        <div className="flex items-center gap-12 mt-3 mb-4">
          <StatItem value={posts.length} label="Posts" />
          <StatItem value={user?.followers?.length ?? 0} label="Seguidores" />
          <StatItem value={user?.following?.length ?? 0} label="Seguindo" />
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
          className="absolute bottom-0 h-[2px] rounded-full bg-primary transition-all duration-200"
          style={{
            width: `calc(50% - 80px)`,
            minWidth: 60,
            left: activeTab === "posts" ? "calc(25% - 30px)" : "calc(75% - 30px)",
          }}
        />
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {activeTab === "posts" &&
          (posts.length > 0 ? (
            posts.map((p) => (
              <ProfilePostCard
                key={p.id}
                post={p}
                onToggleLike={toggleLike}
                onOpenDetail={() => navigate("/social/post", { state: { post: p } })}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted">
              <p className="text-sm font-medium">Ainda não publicaste nada</p>
              <p className="text-xs mt-1">Partilha a tua primeira aventura na página Social</p>
            </div>
          ))}
        {activeTab === "rotas" &&
          (savedRoutes.length > 0 ? (
            savedRoutes.map((r) => (
              <RouteCard
                key={r.id}
                route={r}
                onToggleSave={toggleSave}
                onClick={() => navigate(`/routes/${r.id}`)}
              />
            ))
          ) : (
            <div className="text-center py-12 text-muted">
              <p className="text-sm font-medium">Ainda não guardaste rotas</p>
              <p className="text-xs mt-1">Toca no marcador de uma rota para a guardar aqui</p>
            </div>
          ))}
      </div>
    </>
  );
}
