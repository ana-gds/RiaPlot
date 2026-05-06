import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MOCK_SOCIAL_POSTS } from "../constants/mockData.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, PlusIcon, CommentIcon } from "../components/ui/Icons.jsx";
import { CompactSearch } from "../components/shared/SearchBar.jsx";
import { FeedPostCard } from "../components/shared/PostCard.jsx";

export default function Social() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState(MOCK_SOCIAL_POSTS);
  const [search, setSearch] = useState("");

  const toggleLike = (id) =>
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)));
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
      {/* Sticky toolbar */}
      <div className="flex items-center gap-3 px-4 pb-3 flex-shrink-0 sticky top-0 bg-white z-10 border-b border-secondary/5">
        <CircularButton onClick={() => navigate("/profile")} ariaLabel="Menu" className="md:hidden">
          <MenuIcon />
        </CircularButton>
        <h1 className="hidden md:block text-xl font-bold text-dark shrink-0">Social</h1>
        <CompactSearch value={search} onChange={setSearch} />
      </div>

      {/* Feed — centered with max-width on desktop */}
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
                  onOpenComments={() => navigate("/social/post")}
                />
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CommentIcon size={48} color="var(--color-muted-soft)" className="mb-3" />
              <p className="text-sm font-semibold text-dark">Sem resultados</p>
              <p className="text-xs mt-1 text-muted">
                Tenta pesquisar por um título ou utilizador diferente
              </p>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
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
