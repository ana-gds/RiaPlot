import { useEffect, useRef, useState } from "react";
import { IMAGES } from "../constants/images.js";
import { MOCK_POST_COMMENTS } from "../constants/mockData.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { HeartIcon, CommentIcon, SendIcon } from "../components/ui/Icons.jsx";

const myAvatar = IMAGES.avatars.me;

function CommentsSheet({ open, onClose, comments, onAddComment }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddComment(trimmed);
    setText("");
  };

  return (
    <>
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
        style={{ opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none" }}
      />
      <div
        className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px] transition-transform duration-300 ease-out"
        style={{ transform: open ? "translateY(0)" : "translateY(100%)" }}
      >
        <div className="rounded-t-2xl bg-dark flex flex-col overflow-hidden max-h-[60vh]">
          <div className="flex justify-center pt-3 pb-2">
            <span className="w-[72px] h-1 rounded-full bg-white/30" />
          </div>
          <div className="px-4 pb-3">
            <h3 className="text-base font-bold text-white">Comentários ({comments.length})</h3>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-3" style={{ maxHeight: "calc(60vh - 160px)" }}>
            <div className="flex flex-col gap-4">
              {comments.map((c) => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full overflow-hidden flex-shrink-0 bg-white/10">
                    {c.avatar ? (
                      <img src={c.avatar} alt={c.username} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-primary-soft">
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
          <div className="flex items-center gap-3 px-4 py-3 border-t border-white/10">
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0">
              <img src={myAvatar} alt="Eu" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 h-[42px] rounded-full bg-white/10 flex items-center px-4">
              <input
                ref={inputRef}
                type="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Escreve um comentário..."
                className="flex-1 bg-transparent border-none outline-none text-xs text-white placeholder:text-white/50"
              />
            </div>
            <button
              type="button"
              onClick={send}
              className="flex-shrink-0 p-1 active:scale-90 disabled:opacity-40"
              disabled={!text.trim()}
              aria-label="Enviar"
            >
              <SendIcon />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default function PostDetail() {
  const [liked, setLiked] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(MOCK_POST_COMMENTS);

  const addComment = (text) =>
    setComments((p) => [
      ...p,
      {
        id: Date.now(),
        username: "anacarol1na",
        avatar: myAvatar,
        date: new Date().toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" }),
        text,
      },
    ]);

  return (
    <div className="flex flex-col flex-1">
      <div className="relative w-full h-[328px] flex-shrink-0">
        <img src={IMAGES.posts.detail} alt="Post" className="w-full h-full object-cover" />
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
        <button
          type="button"
          className="absolute right-4 bottom-4 h-10 px-5 rounded-2xl bg-primary-soft text-white text-sm font-semibold shadow-primary-button backdrop-blur-[2px] active:scale-95"
        >
          Ver no mapa
        </button>
      </div>

      <article className="flex-1 -mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8 shadow-top-sheet">
        <header className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E6A45A]">
            <img
              src={IMAGES.avatars.postUser}
              alt="marilia_lucia"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-sm text-dark">marilia_lucia</span>
            <span className="text-xs text-dark/70">07/04 · Costa Nova</span>
          </div>
        </header>

        <h2 className="text-base font-bold mb-2 text-dark">Manhã de passeio na ria</h2>
        <p className="text-xs leading-relaxed mb-6 text-dark/80">
          O espelho de água estava perfeito e as cores das casas tradicionais nunca desiludem.
          Recomendo vivamente esta rota para quem procura relaxar!
        </p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setLiked((l) => !l)}
            className="p-1 active:scale-90"
            aria-label={liked ? "Não gostar" : "Gostar"}
          >
            <HeartIcon filled={liked} size={25} />
          </button>
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="p-1 active:scale-90"
            aria-label="Ver comentários"
          >
            <CommentIcon size={24} />
          </button>
        </div>
      </article>

      <CommentsSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={comments}
        onAddComment={addComment}
      />
    </div>
  );
}
