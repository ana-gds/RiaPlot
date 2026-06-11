import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { HeartIcon, CommentIcon, SendIcon, EditIcon, TrashIcon } from "../components/ui/Icons.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { likePost, addComment, deletePost } from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

function CommentsSheet({ open, onClose, comments, onAddComment, meAvatar, meName }) {
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
                        {c.username?.charAt(0)?.toUpperCase() ?? "?"}
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
            <div className="w-[30px] h-[30px] rounded-full overflow-hidden flex-shrink-0 bg-primary-soft flex items-center justify-center text-white text-xs font-bold">
              {meAvatar ? (
                <img src={meAvatar} alt={meName} className="w-full h-full object-cover" />
              ) : (
                meName?.charAt(0)?.toUpperCase() ?? ""
              )}
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
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const post = state?.post;

  const [liked, setLiked] = useState(() => {
    if (!post) return false;
    if (typeof post.liked === "boolean") return post.liked;
    const myId = user?._id ?? user?.id;
    return Array.isArray(post.likes) ? post.likes.includes(myId) : false;
  });
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(() =>
    (post?.comments ?? []).map((c) => ({
      id: c.id ?? c._id,
      username: c.username ?? "utilizador",
      avatar: c.photo_url ?? null,
      date: formatDate(c.created_at),
      text: c.comment ?? c.text ?? "",
    })),
  );
  const [deleting, setDeleting] = useState(false);

  const myId = user?._id ?? user?.id;
  const isOwner = !!post && !!myId && post.user_id === myId;

  const handleEdit = () => {
    navigate("/social/new", { state: { editPost: post } });
  };

  const handleDelete = async () => {
    if (!post || deleting) return;
    if (!window.confirm("Eliminar este post? Esta ação não pode ser revertida.")) return;
    setDeleting(true);
    try {
      await deletePost(token, post.id);
      navigate("/social");
    } catch {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    setLiked((l) => !l);
    if (post) {
      try {
        await likePost(token, post.id);
      } catch {
        setLiked((l) => !l);
      }
    }
  };

  const handleAddComment = async (text) => {
    if (!post) return;
    try {
      const created = await addComment(token, post.id, text);
      setComments((p) => [
        ...p,
        {
          id: created?.id ?? Date.now(),
          username: created?.username ?? user?.username ?? "eu",
          avatar: created?.photo_url ?? user?.photo_url ?? null,
          date: formatDate(created?.created_at) || formatDate(new Date().toISOString()),
          text: created?.comment ?? text,
        },
      ]);
    } catch {
      // mantém o comentário por enviar; o utilizador pode tentar de novo
    }
  };

  const images = post?.images?.length ? post.images : [post?.image ?? IMAGES.posts.detail];
  const [activeImage, setActiveImage] = useState(0);
  const username = post?.username ?? "";
  const avatar = post?.photo_url ?? null;
  const date = post?.date ?? "";
  const location = post?.location ?? "";
  const title = post?.title ?? "";
  const description = post?.description ?? "";
  const gpxUrl = post?.gpxUrl ?? null;
  const gpxPoints = post?.gpxPoints ?? null;
  const hasRoute = gpxPoints?.length > 0 || !!gpxUrl;

  return (
    <div className="flex flex-col flex-1 -mt-6 md:mt-0">
      <div className="relative w-full h-[328px] flex-shrink-0">
        <img src={images[activeImage]} alt={title} className="w-full h-full object-cover" />
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === activeImage ? "w-5 bg-white" : "w-1.5 bg-white/55"
                }`}
                aria-label={`Foto ${i + 1}`}
              />
            ))}
          </div>
        )}
        {hasRoute && (
          <button
            type="button"
            onClick={() => navigate("/map", { state: { gpxPoints, gpxUrl } })}
            className="absolute right-4 bottom-4 h-10 px-5 rounded-2xl bg-primary-soft text-white text-sm font-semibold shadow-primary-button backdrop-blur-[2px] active:scale-95"
          >
            Ver no mapa
          </button>
        )}
      </div>

      <article className="flex-1 -mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8 shadow-top-sheet">
        <header className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E6A45A] bg-primary-soft flex items-center justify-center text-white font-bold">
            {avatar ? (
              <img src={avatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-px">
            <span className="text-sm text-dark">{username}</span>
            <span className="text-xs text-dark/70">{[date, location].filter(Boolean).join(" · ")}</span>
          </div>
          {isOwner && (
            <div className="ml-auto flex items-center gap-1">
              <button
                type="button"
                onClick={handleEdit}
                className="p-2 rounded-full text-dark/70 hover:bg-dark/5 active:scale-90"
                aria-label="Editar post"
              >
                <EditIcon size={18} color="currentColor" />
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="p-2 rounded-full text-danger hover:bg-danger/10 active:scale-90 disabled:opacity-40"
                aria-label="Eliminar post"
              >
                <TrashIcon size={18} color="currentColor" />
              </button>
            </div>
          )}
        </header>

        <h2 className="text-base font-bold mb-2 text-dark">{title}</h2>
        <p className="text-xs leading-relaxed mb-6 text-dark/80">{description}</p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
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
        onAddComment={handleAddComment}
        meAvatar={user?.photo_url ?? null}
        meName={user?.username ?? ""}
      />
    </div>
  );
}