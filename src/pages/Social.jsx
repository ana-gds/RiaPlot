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
        // Use relative on the layout wrapper so FAB positions relative to it
        <div className="relative flex flex-col flex-1 min-h-0">
            <AppLayout activeTab={activeTab} onChangeTab={onChangeTab}>
                <div className="flex items-center gap-3 px-4 pb-3 flex-shrink-0">
                    <CircularButton onClick={onOpenMenu} ariaLabel="Menu">
                        <MenuIcon />
                    </CircularButton>
                    <CompactSearch value={search} onChange={setSearch} />
                </div>

                <div className="flex-1 overflow-y-auto pt-2 pb-4">
                    {filtered.length > 0 ? (
                        filtered.map((post, i) => (
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
                        ))
                    ) : (
                        // Empty state
                        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" className="mb-3" style={{ color: COLORS.mutedSoft }}>
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"
                                      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p className="text-sm font-semibold" style={{ color: COLORS.dark }}>
                                Sem resultados
                            </p>
                            <p className="text-xs mt-1" style={{ color: COLORS.muted }}>
                                Tenta pesquisar por um título ou utilizador diferente
                            </p>
                        </div>
                    )}
                </div>
            </AppLayout>

            {/* FAB: positioned relative to this wrapper, above the bottom nav (72px) with 16px gap */}
            <button
                type="button"
                onClick={onCreatePost}
                className="fixed right-5 z-20 w-14 h-14 rounded-full flex items-center justify-center active:scale-90 transition-transform"
                style={{
                    bottom: "calc(72px + 16px)",
                    backgroundColor: COLORS.primary,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: SHADOWS.primaryFab,
                }}
                aria-label="Criar post"
            >
                <PlusIcon />
            </button>
        </div>
    );
}