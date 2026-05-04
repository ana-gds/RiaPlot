import { useState } from "react";
import { COLORS, SHADOWS } from "../constants/theme.js";
import { MOCK_SOCIAL_POSTS } from "../constants/mockData.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, PlusIcon } from "../components/ui/Icons.jsx";
import { CompactSearch } from "../components/shared/SearchBar.jsx";
import { FeedPostCard } from "../components/shared/PostCard.jsx";
import { AppLayout } from "../layouts/AppLayout.jsx";

export default function Social({ onOpenMenu, onOpenPost, onCreatePost, activeTab = "social", onChangeTab }) {
  const [posts, setPosts] = useState(MOCK_SOCIAL_POSTS);
  const [search, setSearch] = useState("");

  const toggleLike = (id) =>
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, liked: !x.liked } : x)));
  const toggleSave = (id) =>
    setPosts((p) => p.map((x) => (x.id === id ? { ...x, saved: !x.saved } : x)));

  const q = search.toLowerCase();
  const filtered = search
    ? posts.filter(
        (p) => p.title.toLowerCase().includes(q) || p.username.toLowerCase().includes(q),
      )
    : posts;

  return (
    <AppLayout activeTab={activeTab} onChangeTab={onChangeTab}>
      <div className="flex items-center gap-3 px-4 flex-shrink-0">
        <CircularButton onClick={onOpenMenu}>
          <MenuIcon />
        </CircularButton>
        <CompactSearch value={search} onChange={setSearch} />
      </div>
      <div className="flex-1 overflow-y-auto pt-4">
        {filtered.map((post, i) => (
          <div key={post.id}>
            {i > 0 && (
              <div className="h-px mx-4 my-2" style={{ background: "rgba(0,77,108,0.06)" }} />
            )}
            <FeedPostCard
              post={post}
              onToggleLike={toggleLike}
              onToggleSave={toggleSave}
              onOpenComments={() => onOpenPost?.(post.id)}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCreatePost}
        className="absolute right-5 z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
        style={{
          bottom: "88px",
          backgroundColor: COLORS.primary,
          border: "none",
          cursor: "pointer",
          boxShadow: SHADOWS.primaryFab,
        }}
        aria-label="Criar post"
      >
        <PlusIcon />
      </button>
    </AppLayout>
  );
}
