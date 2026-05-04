import { useEffect, useRef, useState } from "react";
import { COLORS, SHADOWS } from "../constants/theme.js";
import { IMAGES } from "../constants/images.js";
import { MOCK_POST_COMMENTS } from "../constants/mockData.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { HeartIcon, CommentIcon, SendIcon } from "../components/ui/Icons.jsx";

const imgPostPhoto = IMAGES.posts.detail;
const imgUserAvatar = IMAGES.avatars.postUser;
const imgMyAvatar = IMAGES.avatars.me;

function CommentsSheet({ open, onClose, comments, onAddComment }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);
  const send = () => {
    if (!text.trim()) return;
    onAddComment(text.trim());
    setText("");
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.4)",
          opacity: open ? 1 : 0,
          pointerEvents: open ? "auto" : "none",
        }}
      />
      <div
        className="fixed left-0 right-0 bottom-0 z-50 transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)", maxHeight: "60vh" }}
      >
        <div
          className="rounded-t-2xl flex flex-col overflow-hidden"
          style={{ background: COLORS.dark, maxHeight: "60vh" }}
        >
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-[72px] h-1 rounded-full bg-white/30" />
          </div>
          <div className="px-4 pb-3">
            <h3 className="text-base font-bold text-white">Comentários ({comments.length})</h3>
          </div>
          <div
            className="flex-1 overflow-y-auto px-4 pb-3"
            style={{ maxHeight: "calc(60vh - 160px)" }}
          >
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.username} className="w-full h-full object-cover" />
                    ) : (
                      <div
                        className="w-full h-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: "rgba(219,139,49,0.6)" }}
                      >
                        {c.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      <span className="text-[13px] font-bold text-white">{c.username}</span>
                      <span className="text-[11px] text-white/50">{c.date}</span>
                    </div>
                    <p className="text-xs text-white/85 leading-relaxed">{c.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div
            className="flex items-center gap-3 px-4 py-3"
            style={{ borderTop: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0">
              <img src={imgMyAvatar} alt="Eu" className="w-full h-full object-cover" />
            </div>
            <div
              className="flex-1 h-[42px] rounded-full flex items-center px-4"
              style={{ background: "rgba(255,255,255,0.1)" }}
            >
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escreve um comentário..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-white"
              />
            </div>
            <button
              type="button"
              onClick={send}
              className="flex-shrink-0 p-1 active:scale-90"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                opacity: text.trim() ? 1 : 0.4,
              }}
              disabled={!text.trim()}
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PostDetail({ onBack }) {
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(MOCK_POST_COMMENTS);

  const addComment = (text) =>
    setComments((p) => [
      ...p,
      {
        id: Date.now(),
        username: "anacarol1na",
        avatar: imgMyAvatar,
        date: new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
        text,
      },
    ]);

  return (
    <div className="bg-white relative w-full min-h-screen flex flex-col">
      <div className="relative w-full h-[328px] flex-shrink-0">
        <img src={imgPostPhoto} alt="Post" className="w-full h-full object-cover" />
        <div className="absolute left-4 top-12">
          <BackButton onClick={onBack} />
        </div>
        <button
          type="button"
          className="absolute right-4 bottom-4 h-10 px-5 rounded-2xl text-white text-sm font-semibold active:scale-95"
          style={{
            backgroundColor: COLORS.primarySoft,
            backdropFilter: "blur(2px)",
            boxShadow: SHADOWS.primaryButton,
            border: "none",
            cursor: "pointer",
          }}
        >
          Ver no mapa
        </button>
      </div>
      <div
        className="flex-1 -mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8"
        style={{ boxShadow: SHADOWS.topSheet }}
      >
        <div className="flex items-center gap-3 mb-5">
          <div
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0"
            style={{ border: "2px solid #E6A45A" }}
          >
            <img src={imgUserAvatar} alt="marilia_lucia" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-sm" style={{ color: COLORS.dark }}>marilia_lucia</span>
            <span className="text-xs" style={{ color: "rgba(14,44,56,0.7)" }}>07/04 · Costa Nova</span>
          </div>
        </div>
        <h2 className="text-base font-bold mb-2" style={{ color: COLORS.dark }}>
          Manhã de passeio na ria
        </h2>
        <p className="text-xs leading-relaxed mb-6" style={{ color: "rgba(14,44,56,0.8)" }}>
          O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem.
          Recomendo vivamente esta rota para quem procura relaxar!
        </p>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLiked((l) => !l)}
            className="p-1 active:scale-90"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <HeartIcon filled={liked} size={25} />
          </button>
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="p-1 active:scale-90"
            style={{ background: "none", border: "none", cursor: "pointer" }}
          >
            <CommentIcon size={24} />
          </button>
        </div>
      </div>
      <CommentsSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={comments}
        onAddComment={addComment}
      />
    </div>
  );
}
