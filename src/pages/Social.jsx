import { useState } from "react";

const imgAvatar1 = "https://www.figma.com/api/mcp/asset/269bcc3a-5d54-40d4-9540-ff190936fe68";
const imgAvatar2 = "https://www.figma.com/api/mcp/asset/3a2204fd-860e-4bf9-9099-accf34f1b987";
const imgPost1 = "https://www.figma.com/api/mcp/asset/e023dbd7-ceeb-4e17-8a1d-456df71030f1";
const imgPost2 = "https://www.figma.com/api/mcp/asset/2ad39e8f-dd66-44a0-aa73-100c70089cf0";

function HeartIcon({ filled }) {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#DB8B31" : "none"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={filled ? "#DB8B31" : "#0e2c38"} strokeWidth="2" /></svg>;
}
function CommentIcon() {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#0e2c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function BookmarkIcon({ filled }) {
    return <svg width="22" height="22" viewBox="0 0 24 24" fill={filled ? "#004D6C" : "none"}><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={filled ? "#004D6C" : "#0e2c38"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function PostCard({ post, onToggleLike, onToggleSave }) {
    return (
        <article className="pb-2">
            <div className="flex items-center gap-3 px-4 pb-2.5">
                <img src={post.avatar} alt={post.username} className="w-10 h-10 rounded-full object-cover flex-shrink-0" style={{ border: "2px solid #E6A45A" }} />
                <div className="flex flex-col gap-px">
                    <span className="text-sm" style={{ color: "#0e2c38" }}>{post.username}</span>
                    <span className="text-xs" style={{ color: "rgba(14,44,56,0.7)" }}>{post.date} · {post.location}</span>
                </div>
            </div>
            <div className="px-4">
                <div className="relative">
                    <img src={post.image} alt={post.title} className="w-full h-[300px] rounded-2xl object-cover" />
                    {post.route && (
                        <div className="absolute bottom-4 left-4 flex rounded-lg overflow-hidden" style={{ background: "rgba(0,0,0,0.47)", backdropFilter: "blur(1px)" }}>
                            <div className="flex flex-col items-center px-3.5 py-2.5 gap-0.5"><span className="text-[10px] text-white/80">Distância</span><span className="text-xs font-bold text-white">{post.route.distance}</span></div>
                            <div className="w-px bg-white/30 my-2" />
                            <div className="flex flex-col items-center px-3.5 py-2.5 gap-0.5"><span className="text-[10px] text-white/80">Duração</span><span className="text-xs font-bold text-white">{post.route.duration}</span></div>
                        </div>
                    )}
                </div>
            </div>
            <div className="px-4 pt-2.5">
                <h3 className="text-base font-bold mb-1" style={{ color: "#0e2c38" }}>{post.title}</h3>
                <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(14,44,56,0.8)" }}>{post.description}</p>
            </div>
            <div className="flex items-center gap-3.5 px-4 pt-2.5 pb-1">
                <button onClick={() => onToggleLike(post.id)} className="p-1 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }}><HeartIcon filled={post.liked} /></button>
                <button className="p-1" style={{ background: "none", border: "none", cursor: "pointer" }}><CommentIcon /></button>
                <div className="flex-1" />
                <button onClick={() => onToggleSave(post.id)} className="p-1 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }}><BookmarkIcon filled={post.saved} /></button>
            </div>
        </article>
    );
}

const NAV_ITEMS = [
    { key: "rotas", label: "Rotas", d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" },
    { key: "mapa", label: "Mapa", d: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.553 2.776A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" },
    { key: "social", label: "Social", d: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
    { key: "notificacoes", label: "Notificações", d: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" },
];

function BottomNav({ active, onChange }) {
    return (
        <nav className="flex-shrink-0 flex items-center justify-around px-2" style={{ height: "72px", borderTop: "1px solid rgba(0,77,108,0.06)" }}>
            {NAV_ITEMS.map((item) => {
                const isActive = active === item.key;
                return (
                    <button key={item.key} onClick={() => onChange(item.key)} className="relative flex flex-col items-center gap-1 px-3 py-1.5" style={{ background: "none", border: "none", cursor: "pointer" }}>
                        {isActive && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-[3px] rounded-b" style={{ backgroundColor: "#DB8B31" }} />}
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d={item.d} stroke={isActive ? "#0e2c38" : "#bfbbb7"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        <span className="text-xs" style={{ fontWeight: isActive ? 500 : 400, color: isActive ? "#0e2c38" : "#bfbbb7" }}>{item.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}

const POSTS = [
    { id: 1, username: "marilia_lucia", avatar: imgAvatar1, date: "07/04", location: "Costa Nova", image: imgPost1, title: "Manhã de passeio na ria", description: "O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota...", liked: true, saved: false },
    { id: 2, username: "lourencosoares", avatar: imgAvatar2, date: "05/04", location: "Ilha do Monte Farinha", image: imgPost2, title: "Manhã de passeio na ria", description: "O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota...", liked: false, saved: false, route: { distance: "5.5nm", duration: "1h 20m" } },
];

export default function Comunidade() {
    const [posts, setPosts] = useState(POSTS);
    const [activeTab, setActiveTab] = useState("social");
    const [search, setSearch] = useState("");
    const toggleLike = (id) => setPosts((p) => p.map((x) => x.id === id ? { ...x, liked: !x.liked } : x));
    const toggleSave = (id) => setPosts((p) => p.map((x) => x.id === id ? { ...x, saved: !x.saved } : x));
    const filtered = search ? posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()) || p.username.toLowerCase().includes(search.toLowerCase())) : posts;

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            <div className="h-12 flex-shrink-0" />
            <div className="flex items-center gap-3 px-4 flex-shrink-0">
                <button className="w-[46px] h-[46px] rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: "#004D6C", border: "none", cursor: "pointer", boxShadow: "0 2px 8px rgba(0,77,108,0.3)" }}><svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 12h18M3 6h18M3 18h18" stroke="white" strokeWidth="2.2" strokeLinecap="round" /></svg></button>
                <div className="flex-1 h-12 rounded-[18px] flex items-center px-4 gap-2.5" style={{ background: "#fff8ef", boxShadow: "0 4px 4px rgba(0,0,0,0.08)" }}>
                    <input type="text" placeholder="Procura um post" value={search} onChange={(e) => setSearch(e.target.value)} className="flex-1 bg-transparent border-none outline-none text-sm" style={{ fontWeight: 300, color: "#0e2c38" }} />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="8" stroke="#004D6C" strokeWidth="2" /><path d="M21 21l-4.35-4.35" stroke="#004D6C" strokeWidth="2" strokeLinecap="round" /></svg>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pt-4">
                {filtered.map((post, i) => (
                    <div key={post.id}>
                        {i > 0 && <div className="h-px mx-4 my-2" style={{ background: "rgba(0,77,108,0.06)" }} />}
                        <PostCard post={post} onToggleLike={toggleLike} onToggleSave={toggleSave} />
                    </div>
                ))}
            </div>
            {/* FAB - Criar Post */}
            <button
                onClick={() => {
                    // TODO: navigate to CriarPost
                    console.log("Criar post");
                }}
                className="absolute right-5 z-10 w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-transform"
                style={{
                    bottom: "88px",
                    backgroundColor: "#DB8B31",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 6px 20px rgba(219,139,49,0.45)",
                }}
                aria-label="Criar post"
            >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                    <line x1="5" y1="12" x2="19" y2="12" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
            </button>

            <BottomNav active={activeTab} onChange={setActiveTab} />
        </div>
    );
}
