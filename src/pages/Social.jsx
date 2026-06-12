import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, PlusIcon, CommentIcon } from "../components/ui/Icons.jsx";
import { SearchBar } from "../components/shared/SearchBar.jsx";
import { FeedPostCard } from "../components/shared/PostCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getPosts, likePost } from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

// Quantos posts mostrar de cada vez (paginação no cliente).
const PAGE_SIZE = 5;

export default function Social() {
  const navigate = useNavigate();
  const { openSidebar } = useOutletContext();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    getPosts(token)
      .then((data) => {
        setPosts(
          data.map((p) => ({
            id: p.id ?? p._id,
            user_id: p.user_id,
            username: p.username ?? "unknown",
            avatar: p.photo_url ?? null,
            photo_url: p.photo_url ?? null,
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
            liked: (p.likes ?? []).includes(user?._id ?? user?.id),
            likes: (p.likes ?? []).length,
            commentCount: (p.comments ?? []).length,
            saved: false,
          })),
        );
      })
      .catch(() => {});
  }, [token]);

  const toggleLike = async (id) => {
    // Atualização otimista da contagem e do estado.
    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
          : x,
      ),
    );
    try {
      const res = await likePost(token, id);
      // Reconcilia com a verdade do servidor (contagem e estado).
      setPosts((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                liked: typeof res?.liked === "boolean" ? res.liked : x.liked,
                likes: typeof res?.likes === "number" ? res.likes : x.likes,
              }
            : x,
        ),
      );
    } catch {
      // Reverte (voltar a aplicar o mesmo toggle desfaz o otimista).
      setPosts((p) =>
        p.map((x) =>
          x.id === id
            ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
            : x,
        ),
      );
    }
  };

  const toggleSave = (id) =>
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, saved: !x.saved } : x)));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title.toLowerCase().includes(q) || p.username.toLowerCase().includes(q),
    );
  }, [posts, search]);

  const visible = useMemo(() => filtered.slice(0, visibleCount), [filtered, visibleCount]);

  const handleSearch = (v) => {
    setSearch(v);
    setVisibleCount(PAGE_SIZE);
  };

  return (
    <>
      <div className="flex items-center gap-3 px-4 pb-3 flex-shrink-0 sticky top-0 bg-white z-10 border-b border-secondary/5">
        <CircularButton onClick={openSidebar} ariaLabel="Menu" className="md:hidden">
          <MenuIcon />
        </CircularButton>
        <h1 className="hidden md:block text-xl font-bold text-dark shrink-0">Social</h1>
        <SearchBar
          value={search}
          onChange={handleSearch}
          onClear={() => handleSearch("")}
          placeholder="Procura um post ou utilizador"
        />
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        <div className="w-full md:max-w-xl md:mx-auto">
          {filtered.length > 0 ? (
            <>
              {visible.map((post, i) => (
                <div key={post.id}>
                  {i > 0 && <div className="h-px mx-4 my-2 bg-secondary/10" />}
                  <FeedPostCard
                    post={post}
                    onToggleLike={toggleLike}
                    onToggleSave={toggleSave}
                    onOpenDetail={() => navigate("/social/post", { state: { post } })}
                    onOpenComments={() => navigate("/social/post", { state: { post } })}
                  />
                </div>
              ))}

              {visibleCount < filtered.length && (
                <div className="flex flex-col items-center gap-2 mt-4 mb-2">
                  <span className="text-xs text-muted">
                    A mostrar {visible.length} de {filtered.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                    className="h-11 px-6 rounded-2xl bg-primary text-white text-sm font-semibold shadow-primary-button active:scale-95"
                  >
                    Carregar mais
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CommentIcon size={48} color="var(--color-muted-soft)" className="mb-3" />
              <p className="text-sm font-semibold text-dark">Sem publicações</p>
              <p className="text-xs mt-1 text-muted">
                Sê o primeiro a partilhar uma aventura!
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/social/new")}
        className="fixed right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center bg-primary shadow-primary-fab active:scale-90 transition-transform bottom-[calc(72px+16px)] md:bottom-6"
        aria-label="Criar post"
      >
        <PlusIcon />
      </button>
    </>
  );
}