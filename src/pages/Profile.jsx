import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { MOCK_PROFILE_POSTS, MOCK_PROFILE_ROUTES } from "../constants/mockData.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { ProfilePostCard } from "../components/shared/PostCard.jsx";
import { RouteCardCompact } from "../components/shared/RouteCard.jsx";

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
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState(MOCK_PROFILE_POSTS);

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
          <img src={IMAGES.avatars.me} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-xl font-bold mt-3 text-dark font-inter">Ana Guedes</h1>
        <p className="text-[11px] text-dark/60">anacarol1na</p>
        <div className="flex items-center gap-12 mt-3 mb-4">
          <StatItem value={12} label="Posts" />
          <StatItem value={245} label="Seguidores" />
          <StatItem value={189} label="Seguindo" />
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
          posts.map((p) => <ProfilePostCard key={p.id} post={p} onToggleLike={toggleLike} />)}
        {activeTab === "rotas" &&
          MOCK_PROFILE_ROUTES.map((r) => <RouteCardCompact key={r.id} route={r} />)}
      </div>
    </>
  );
}
