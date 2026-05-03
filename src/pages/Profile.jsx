import { useState } from "react";

const imgAvatar = "https://www.figma.com/api/mcp/asset/62db0069-df77-4ad2-a0d3-38f546d54523";
const imgPost = "https://www.figma.com/api/mcp/asset/09585e83-0bcb-45b6-aa01-25c5fea886d8";
const imgMessages = "https://www.figma.com/api/mcp/asset/1aae09f2-597c-4c7a-b5bd-9e2465031479";

function BackButton({ onClick }) {
    return (
        <button onClick={onClick} className="absolute left-4 top-0 w-10 h-10 rounded-full flex items-center justify-center shadow-md transition-transform active:scale-95" style={{ backgroundColor: "#004D6C" }} aria-label="Voltar">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
    );
}

function StatItem({ value, label }) {
    return (
        <div className="flex flex-col items-center gap-0.5">
            <span className="text-[18px] font-bold" style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}>{value}</span>
            <span className="text-[12px] font-normal" style={{ color: "rgba(14,44,56,0.7)", fontFamily: "Manrope, sans-serif" }}>{label}</span>
        </div>
    );
}

function HeartIcon({ filled }) {
    return (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={filled ? "#DB8B31" : "#0e2c38"} strokeWidth="2" fill={filled ? "#DB8B31" : "none"} />
        </svg>
    );
}

function PostCard({ post, onToggleLike }) {
    return (
        <article className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(0,77,108,0.08)" }}>
            <div className="w-full h-[220px] overflow-hidden"><img src={post.image} alt={post.title} className="w-full h-full object-cover" /></div>
            <div className="px-4 pt-3 pb-1">
                <h3 className="text-base font-bold mb-1" style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}>{post.title}</h3>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(14,44,56,0.75)", fontFamily: "Manrope, sans-serif" }}>{post.description}</p>
            </div>
            <div className="flex items-center gap-4 px-4 py-3 mt-1" style={{ borderTop: "1px solid #f0f0f0" }}>
                <button onClick={() => onToggleLike(post.id)} className="flex items-center gap-1.5 active:scale-90" style={{ fontSize: "12px", fontWeight: 600, color: post.liked ? "#DB8B31" : "#0e2c38", background: "none", border: "none", cursor: "pointer" }}>
                    <HeartIcon filled={post.liked} /><span>{post.likes}</span>
                </button>
                <button className="flex items-center gap-1.5" style={{ fontSize: "12px", fontWeight: 600, color: "#0e2c38", background: "none", border: "none", cursor: "pointer" }}>
                    <img src={imgMessages} alt="" className="w-[22px] h-[22px]" /><span>{post.comments}</span>
                </button>
            </div>
        </article>
    );
}

function RouteCard({ route }) {
    return (
        <article className="rounded-2xl overflow-hidden bg-white" style={{ boxShadow: "0 2px 12px rgba(0,77,108,0.08)" }}>
            <div className="w-full h-[180px] flex items-end p-3" style={{ background: "linear-gradient(160deg, #004D6C, #126587)" }}>
                <span className="text-white text-[11px] font-bold px-3 py-1 rounded-full" style={{ backgroundColor: "rgba(219,139,49,0.9)" }}>{route.distance} · {route.duration}</span>
            </div>
            <div className="px-4 pt-3 pb-1">
                <h3 className="text-base font-bold mb-1" style={{ color: "#0e2c38" }}>{route.name}</h3>
                <p className="text-xs leading-relaxed" style={{ color: "rgba(14,44,56,0.75)" }}>{route.description}</p>
            </div>
            <div className="px-4 py-3" style={{ borderTop: "1px solid #f0f0f0" }}>
                <button className="text-[13px] font-bold flex items-center gap-1.5" style={{ color: "#004D6C", background: "none", border: "none", cursor: "pointer" }}>Ver rota</button>
            </div>
        </article>
    );
}

const POSTS = [{ id: 1, title: "Manhã de passeio na ria", description: "O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota...", image: imgPost, likes: 47, comments: 8, liked: false }];
const ROUTES = [{ id: 1, name: "Rota Canal Central", distance: "12.4 km", duration: "~2h30", description: "Percurso pelo canal central de Aveiro. Ideal para embarcações com calado até 1.2m." }];

export default function Perfil() {
    const [activeTab, setActiveTab] = useState("posts");
    const [posts, setPosts] = useState(POSTS);
    const toggleLike = (id) => setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked, likes: x.liked ? x.likes - 1 : x.likes + 1 } : x));
    const ind = activeTab === "posts" ? { left: "calc(25% - 41px)", width: "82px" } : { left: "calc(75% - 36px)", width: "72px" };

    return (
        <div className="bg-white relative w-full min-h-screen">
            <div className="h-12" />
            <div className="relative h-10 mb-2"><BackButton onClick={() => window.history.back()} /></div>
            <div className="flex flex-col items-center px-4 gap-1">
                <div className="w-[100px] h-[100px] rounded-full overflow-hidden" style={{ border: "3px solid #DB8B31", boxShadow: "0 4px 16px rgba(219,139,49,0.3)" }}><img src={imgAvatar} alt="Avatar" className="w-full h-full object-cover" /></div>
                <h1 className="text-[20px] font-bold mt-3" style={{ color: "#0e2c38", fontFamily: "Inter, sans-serif" }}>Ana Guedes</h1>
                <p className="text-[11px]" style={{ color: "rgba(14,44,56,0.6)" }}>anacarol1na</p>
                <div className="flex items-center gap-12 mt-3 mb-4"><StatItem value={12} label="Posts" /><StatItem value={245} label="Seguidores" /><StatItem value={189} label="Seguindo" /></div>
                <button className="px-6 py-2.5 rounded-2xl text-white text-[15px] font-semibold active:scale-95 mb-2" style={{ backgroundColor: "rgba(219,139,49,0.9)", width: "138px" }}>Editar perfil</button>
            </div>
            <div className="relative flex mt-4" style={{ borderBottom: "1px solid #e8e8e8" }}>
                <button className="flex-1 py-2.5 text-sm" style={{ fontWeight: activeTab === "posts" ? 600 : 400, color: activeTab === "posts" ? "#0e2c38" : "#bfbbb7", background: "none", border: "none", cursor: "pointer" }} onClick={() => setActiveTab("posts")}>Posts</button>
                <button className="flex-1 py-2.5 text-sm" style={{ fontWeight: activeTab === "rotas" ? 600 : 400, color: activeTab === "rotas" ? "#0e2c38" : "#bfbbb7", background: "none", border: "none", cursor: "pointer" }} onClick={() => setActiveTab("rotas")}>Rotas</button>
                <div className="absolute bottom-0 h-[2px] rounded-full transition-all duration-200" style={{ backgroundColor: "#DB8B31", ...ind }} />
            </div>
            <div className="px-4 py-4 flex flex-col gap-4">
                {activeTab === "posts" && posts.map((p) => <PostCard key={p.id} post={p} onToggleLike={toggleLike} />)}
                {activeTab === "rotas" && ROUTES.map((r) => <RouteCard key={r.id} route={r} />)}
            </div>
        </div>
    );
}
