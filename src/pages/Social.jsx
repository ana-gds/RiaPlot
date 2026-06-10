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

export default function Social() {
  const navigate = useNavigate();
  const { openSidebar } = useOutletContext();
  const { user, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getPosts(token)
      .then((data) => {
        setPosts(
          data.map((p) => ({
            id: p.id ?? p._id,
            username: p.username ?? "unknown",
            avatar: IMAGES.avatars.user1,
            date: formatDate(p.created_at),
            location: p.location ?? "",
            image: p.post_url?.[0] ?? IMAGES.posts.feed1,
            images: p.post_url ?? [],
            gpxUrl: p.gpx_url ?? null,
            gpxPoints: p.gpx_points ?? null,
            title: p.title,
            description: p.description,
            liked: (p.likes ?? []).includes(user?._id ?? user?.id),
            saved: false,
            route: p.route_doc || p.gpx_url ? { distance: "—", duration: "—" } : null,
          })),
        );
      })
      .catch(() => {});
  }, [token]);

  const toggleLike = async (id) => {
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)));
    try {
      await likePost(token, id);
    } catch {
      setPosts((p) => p.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)));
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

  return (
    <>
      <div className="flex items-center gap-3 px-4 pb-3 flex-shrink-0 sticky top-0 bg-white z-10 border-b border-secondary/5">
        <CircularButton onClick={openSidebar} ariaLabel="Menu" className="md:hidden">
          <MenuIcon />
        </CircularButton>
        <h1 className="hidden md:block text-xl font-bold text-dark shrink-0">Social</h1>
        <SearchBar
          value={search}
          onChange={setSearch}
          onClear={() => setSearch("")}
          placeholder="Procura um post ou utilizador"
        />
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        <div className="w-full md:max-w-xl md:mx-auto">
          {filtered.length > 0 ? (
            filtered.map((post, i) => (
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
            ))
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