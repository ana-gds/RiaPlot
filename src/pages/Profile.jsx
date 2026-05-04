import { useState } from "react";
import { COLORS, FONTS, SHADOWS } from "../constants/theme.js";
import { IMAGES } from "../constants/images.js";
import { MOCK_PROFILE_POSTS, MOCK_PROFILE_ROUTES } from "../constants/mockData.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { ProfilePostCard } from "../components/shared/PostCard.jsx";
import { RouteCardCompact } from "../components/shared/RouteCard.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

function StatItem({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span
        className="text-[18px] font-bold"
        style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
      >
        {value}
      </span>
      <span
        className="text-[12px] font-normal"
        style={{ color: "rgba(14,44,56,0.7)", fontFamily: FONTS.manrope }}
      >
        {label}
      </span>
    </div>
  );
}

export default function Profile({ onBack, onEditProfile }) {
  const [activeTab, setActiveTab] = useState("posts");
  const [posts, setPosts] = useState(MOCK_PROFILE_POSTS);

  const toggleLike = (id) =>
    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 }
          : x,
      ),
    );

  const indicator =
    activeTab === "posts"
      ? { left: "calc(25% - 41px)", width: "82px" }
      : { left: "calc(75% - 36px)", width: "72px" };

  return (
    <PageShell>
      <div className="relative h-10 mb-2">
        <div className="absolute left-4 top-0">
          <BackButton onClick={onBack} />
        </div>
      </div>
      <div className="flex flex-col items-center px-4 gap-1">
        <div
          className="w-[100px] h-[100px] rounded-full overflow-hidden"
          style={{ border: `3px solid ${COLORS.primary}`, boxShadow: "0 4px 16px rgba(219,139,49,0.3)" }}
        >
          <img src={IMAGES.avatars.me} alt="Avatar" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-[20px] font-bold mt-3" style={{ color: COLORS.dark, fontFamily: FONTS.inter }}>
          Ana Guedes
        </h1>
        <p className="text-[11px]" style={{ color: "rgba(14,44,56,0.6)" }}>anacarol1na</p>
        <div className="flex items-center gap-12 mt-3 mb-4">
          <StatItem value={12} label="Posts" />
          <StatItem value={245} label="Seguidores" />
          <StatItem value={189} label="Seguindo" />
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="px-6 py-2.5 rounded-2xl text-white text-[15px] font-semibold active:scale-95 mb-2"
          style={{ backgroundColor: COLORS.primarySoft, width: "138px", boxShadow: SHADOWS.primaryButton, border: "none", cursor: "pointer" }}
        >
          Editar perfil
        </button>
      </div>
      <div className="relative flex mt-4" style={{ borderBottom: "1px solid #e8e8e8" }}>
        <button
          type="button"
          className="flex-1 py-2.5 text-sm"
          style={{
            fontWeight: activeTab === "posts" ? 600 : 400,
            color: activeTab === "posts" ? COLORS.dark : COLORS.mutedSoft,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("posts")}
        >
          Posts
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 text-sm"
          style={{
            fontWeight: activeTab === "rotas" ? 600 : 400,
            color: activeTab === "rotas" ? COLORS.dark : COLORS.mutedSoft,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
          onClick={() => setActiveTab("rotas")}
        >
          Rotas
        </button>
        <div
          className="absolute bottom-0 h-[2px] rounded-full transition-all duration-200"
          style={{ backgroundColor: COLORS.primary, ...indicator }}
        />
      </div>
      <div className="px-4 py-4 flex flex-col gap-4">
        {activeTab === "posts" &&
          posts.map((p) => <ProfilePostCard key={p.id} post={p} onToggleLike={toggleLike} />)}
        {activeTab === "rotas" &&
          MOCK_PROFILE_ROUTES.map((r) => <RouteCardCompact key={r.id} route={r} />)}
      </div>
    </PageShell>
  );
}
