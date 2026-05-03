import { useState, useRef, useEffect } from "react";

const imgPostPhoto = "https://www.figma.com/api/mcp/asset/5f3fb6b2-8402-471c-b65b-9a3dc3d43141";
const imgUserAvatar = "https://www.figma.com/api/mcp/asset/9629d679-afa3-47cd-872a-98e158dde15a";
const imgCommentAvatar1 = "https://www.figma.com/api/mcp/asset/3a2204fd-860e-4bf9-9099-accf34f1b987";
const imgMyAvatar = "https://www.figma.com/api/mcp/asset/62db0069-df77-4ad2-a0d3-38f546d54523";

function CommentsSheet({ open, onClose, comments, onAddComment }) {
    const [text, setText] = useState("");
    const inputRef = useRef(null);
    useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 350); }, [open]);
    const send = () => { if (!text.trim()) return; onAddComment(text.trim()); setText(""); };

    return (
        <>
            <div onClick={onClose} className="fixed inset-0 z-40 transition-opacity duration-300" style={{ background: "rgba(0,0,0,0.4)", opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }} />
            <div className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out" style={{ transform: open ? "translateY(0)" : "translateY(100%)", maxHeight: "60vh" }}>
                <div className="rounded-t-2xl flex flex-col overflow-hidden" style={{ background: "#0e2c38", maxHeight: "60vh" }}>
                    <div className="flex justify-center pt-3 pb-2"><div className="w-[72px] h-1 rounded-full bg-white/30" /></div>
                    <div className="px-4 pb-3"><h3 className="text-base font-bold text-white">Comentários ({comments.length})</h3></div>
                    <div className="flex-1 overflow-y-auto px-4 pb-3" style={{ maxHeight: "calc(60vh - 160px)" }}>
                        <div className="flex flex-col gap-4">
                            {comments.map((c) => (
                                <div key={c.id} className="flex gap-3">
                                    <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                                        {c.avatar ? <img src={c.avatar} alt={c.username} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "rgba(219,139,49,0.6)" }}>{c.username.charAt(0).toUpperCase()}</div>}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline gap-2 mb-0.5"><span className="text-[13px] font-bold text-white">{c.username}</span><span className="text-[11px] text-white/50">{c.date}</span></div>
                                        <p className="text-xs text-white/85 leading-relaxed">{c.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="flex items-center gap-3 px-4 py-3" style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                        <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0"><img src={imgMyAvatar} alt="Eu" className="w-full h-full object-cover" /></div>
                        <div className="flex-1 h-[42px] rounded-full flex items-center px-4" style={{ background: "rgba(255,255,255,0.1)" }}>
                            <input ref={inputRef} type="text" value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder="Escreve um comentário..." className="flex-1 bg-transparent border-none outline-none text-xs text-white" />
                        </div>
                        <button onClick={send} className="flex-shrink-0 p-1 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer", opacity: text.trim() ? 1 : 0.4 }} disabled={!text.trim()}>
                            <svg width="24" height="21" viewBox="0 0 24 24" fill="none"><path d="M22 2L11 13" stroke="#DB8B31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="#DB8B31" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}

const COMMENTS = [
    { id: 1, username: "lourencosoares", avatar: imgCommentAvatar1, date: "07/04", text: "Que fotos incríveis! Também adoro esta zona da Costa Nova." },
    { id: 2, username: "anacarol1na", avatar: null, date: "07/04", text: "Concordo! É um dos meus lugares favoritos para remar." },
];

export default function DetalhePost() {
    const [liked, setLiked] = useState(false);
    const [commentsOpen, setCommentsOpen] = useState(false);
    const [comments, setComments] = useState(COMMENTS);
    const addComment = (text) => setComments((p) => [...p, { id: Date.now(), username: "anacarol1na", avatar: imgMyAvatar, date: new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }), text }]);

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            <div className="relative w-full h-[328px] flex-shrink-0">
                <img src={imgPostPhoto} alt="Post" className="w-full h-full object-cover" />
                <button onClick={() => window.history.back()} className="absolute left-4 top-12 w-10 h-10 rounded-full flex items-center justify-center shadow-md active:scale-95" style={{ backgroundColor: "#004D6C" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
                <button className="absolute right-4 bottom-4 h-10 px-5 rounded-2xl text-white text-sm font-semibold active:scale-95" style={{ backgroundColor: "rgba(219,139,49,0.9)", backdropFilter: "blur(2px)", boxShadow: "0 4px 14px rgba(219,139,49,0.35)" }}>Ver no mapa</button>
            </div>
            <div className="flex-1 -mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8" style={{ boxShadow: "0 -4px 20px rgba(0,0,0,0.06)" }}>
                <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0" style={{ border: "2px solid #E6A45A" }}><img src={imgUserAvatar} alt="marilia_lucia" className="w-full h-full object-cover" /></div>
                    <div className="flex flex-col gap-px"><span className="text-sm" style={{ color: "#0e2c38" }}>marilia_lucia</span><span className="text-xs" style={{ color: "rgba(14,44,56,0.7)" }}>07/04 · Costa Nova</span></div>
                </div>
                <h2 className="text-base font-bold mb-2" style={{ color: "#0e2c38" }}>Manhã de passeio na ria</h2>
                <p className="text-xs leading-relaxed mb-6" style={{ color: "rgba(14,44,56,0.8)" }}>O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem. Recomendo vivamente esta rota para quem procura relaxar!</p>
                <div className="flex items-center gap-4">
                    <button onClick={() => setLiked((l) => !l)} className="p-1 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <svg width="25" height="22" viewBox="0 0 24 24" fill={liked ? "#DB8B31" : "none"}><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={liked ? "#DB8B31" : "#0e2c38"} strokeWidth="2" /></svg>
                    </button>
                    <button onClick={() => setCommentsOpen(true)} className="p-1 active:scale-90" style={{ background: "none", border: "none", cursor: "pointer" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="#0e2c38" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                    </button>
                </div>
            </div>
            <CommentsSheet open={commentsOpen} onClose={() => setCommentsOpen(false)} comments={comments} onAddComment={addComment} />
        </div>
    );
}
