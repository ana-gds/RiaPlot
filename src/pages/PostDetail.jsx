import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { HeartIcon, CommentIcon, SendIcon, EditIcon, TrashIcon, CloseIcon } from "../components/ui/Icons.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  likePost,
  addComment,
  updateComment,
  deleteComment,
  likeComment,
  deletePost,
  followUser,
} from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

// Normaliza um id para string, lidando com ids embrulhados (ex.: { $oid }),
// para que as comparações de dono/autor não falhem por diferença de forma.
function idStr(v) {
  if (v == null) return null;
  if (typeof v === "object") return v.$oid ?? String(v);
  return String(v);
}

// Mapeia um comentário enriquecido da API para a forma usada na UI.
function mapComment(c, myId) {
  const likesArr = Array.isArray(c.likes) ? c.likes : [];
  return {
    id: c.id ?? c._id,
    user_id: c.user_id ?? null,
    username: c.username ?? "utilizador",
    avatar: c.photo_url ?? null,
    date: formatDate(c.created_at),
    text: c.comment ?? c.text ?? "",
    parent_id: c.parent_id ?? null,
    liked: likesArr.includes(myId),
    likes: likesArr.length,
  };
}

function CommentsSheet({
  open,
  onClose,
  comments,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onLikeComment,
  onReply,
  onOpenProfile,
  meId,
  isPostOwner,
  meAvatar,
  meName,
}) {
  const [text, setText] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  // Comentário a que se está a responder ({ id, username }) ou null para
  // comentar normalmente. A resposta usa a mesma caixa de texto do fundo.
  const [replyTarget, setReplyTarget] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 350);
  }, [open]);

  const send = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (replyTarget) {
      // Não envia uma resposta que seja apenas a menção, sem conteúdo.
      const mention = replyTarget.mention.trim();
      const body = trimmed.startsWith(mention) ? trimmed.slice(mention.length).trim() : trimmed;
      if (!body) return;
      onReply?.(replyTarget.id, trimmed);
      setReplyTarget(null);
    } else {
      onAddComment(trimmed);
    }
    setText("");
  };

  const startEdit = (c) => {
    setReplyTarget(null);
    setEditingId(c.id);
    setEditText(c.text);
  };
  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };
  const saveEdit = () => {
    const trimmed = editText.trim();
    if (trimmed) onEditComment?.(editingId, trimmed);
    cancelEdit();
  };

  const startReply = (c) => {
    setEditingId(null);
    // Responder a uma resposta anexa ao mesmo tópico (o comentário de topo),
    // para a nova resposta ficar visível na mesma cadeia. Pré-preenche a caixa
    // com "@nome " para deixar claro a quem se está a responder.
    const threadId = c.parent_id ?? c.id;
    const mention = `@${c.username} `;
    setReplyTarget({ id: threadId, username: c.username, mention });
    setText(mention);
    setTimeout(() => inputRef.current?.focus(), 50);
  };
  const cancelReply = () => {
    // Remove a menção pré-preenchida ao voltar a comentar normalmente.
    setText((t) => (replyTarget?.mention && t.startsWith(replyTarget.mention) ? t.slice(replyTarget.mention.length) : t));
    setReplyTarget(null);
  };

  // Agrupa as respostas pelo comentário pai.
  const topLevel = comments.filter((c) => !c.parent_id);
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id);

  const renderComment = (c, isReply) => {
    const openProfile = () => c.user_id && onOpenProfile?.(c.user_id);
    const canEdit = !!c.user_id && idStr(c.user_id) === meId;
    const canDelete = canEdit || isPostOwner;
    const isEditing = editingId === c.id;

    const avatarSize = isReply ? "w-8 h-8" : "w-9 h-9";

    return (
      <div key={c.id} className="flex gap-2.5">
        {/* Avatar (alinhado ao topo, junto ao username). */}
        <div
          onClick={openProfile}
          className={`${avatarSize} rounded-full overflow-hidden flex-shrink-0 bg-white/10 ${
            c.user_id ? "cursor-pointer" : ""
          }`}
        >
          {c.avatar ? (
            <img src={c.avatar} alt={c.username} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white bg-primary-soft">
              {c.username?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Linha do username: nome + data à esquerda, like e ações à direita. */}
          <div className="flex items-center gap-2">
            <span
              onClick={openProfile}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openProfile();
              }}
              className={`text-[13px] font-semibold text-white truncate ${
                c.user_id ? "cursor-pointer hover:underline" : ""
              }`}
            >
              {c.username}
            </span>
            <span className="text-[11px] text-white/40 flex-shrink-0">{c.date}</span>

            <div className="ml-auto flex items-center gap-1 flex-shrink-0">
              {/* Botão de gostar do comentário */}
              <button
                type="button"
                onClick={() => onLikeComment?.(c.id)}
                className="flex items-center gap-1 text-[12px] text-white/60 hover:text-white active:scale-90"
                aria-label={c.liked ? "Não gostar" : "Gostar"}
              >
                <HeartIcon filled={c.liked} size={16} />
                {c.likes > 0 && <span>{c.likes}</span>}
              </button>
              {canEdit && !isEditing && (
                <button
                  type="button"
                  onClick={() => startEdit(c)}
                  className="p-1 text-white/50 hover:text-white active:scale-90"
                  aria-label="Editar comentário"
                >
                  <EditIcon size={14} color="currentColor" />
                </button>
              )}
              {canDelete && !isEditing && (
                <button
                  type="button"
                  onClick={() => onDeleteComment?.(c.id)}
                  className="p-1 text-white/50 hover:text-danger active:scale-90"
                  aria-label="Eliminar comentário"
                >
                  <TrashIcon size={14} color="currentColor" />
                </button>
              )}
            </div>
          </div>

          {isEditing ? (
            <div className="flex flex-col gap-2 mt-1.5">
              <input
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") cancelEdit();
                }}
                autoFocus
                className="w-full rounded-lg bg-white/10 px-3 py-2 text-xs text-white outline-none placeholder:text-white/40"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={saveEdit}
                  disabled={!editText.trim()}
                  className="h-7 px-3 rounded-full bg-primary text-white text-[11px] font-semibold active:scale-95 disabled:opacity-40"
                >
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="h-7 px-3 rounded-full bg-white/10 text-white/70 text-[11px] font-semibold active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <p className="text-[13px] text-white/85 leading-snug mt-0.5">{c.text}</p>
          )}

          {/* "Responder", alinhado à esquerda com o texto do comentário.
              Disponível também nas respostas (anexa ao mesmo tópico). */}
          {!isEditing && (
            <button
              type="button"
              onClick={() => startReply(c)}
              className="block mt-1 text-[12px] font-semibold text-white/50 hover:text-white active:scale-95"
            >
              Responder
            </button>
          )}

          {/* Respostas (um nível) */}
          {!isReply && repliesOf(c.id).length > 0 && (
            <div className="mt-3 flex flex-col gap-4 pl-3 border-l border-white/10">
              {repliesOf(c.id).map((r) => renderComment(r, true))}
            </div>
          )}
        </div>
      </div>
    );
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
              {topLevel.map((c) => renderComment(c, false))}
            </div>
          </div>
          <div className="border-t border-white/10">
            {/* Indicação de resposta: aparece por cima da caixa, com um X para
                voltar a comentar normalmente. */}
            {replyTarget && (
              <div className="flex items-center justify-between px-4 pt-2.5 -mb-1">
                <span className="text-[13px] text-white/70">
                  A responder a <span className="font-semibold text-white">{replyTarget.username}</span>
                </span>
                <button
                  type="button"
                  onClick={cancelReply}
                  className="p-1 -mr-1 text-white/60 hover:text-white active:scale-90"
                  aria-label="Cancelar resposta"
                >
                  <CloseIcon size={14} color="currentColor" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-3 px-4 py-3">
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
                  onKeyDown={(e) => {
                    if (e.key === "Enter") send();
                    if (e.key === "Escape" && replyTarget) cancelReply();
                  }}
                  placeholder={replyTarget ? `Responder a ${replyTarget.username}...` : "Escreve um comentário..."}
                  className="flex-1 bg-transparent border-none outline-none text-[13px] text-white placeholder:text-white/50"
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
      </div>
    </>
  );
}

export default function PostDetail() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();
  const post = state?.post;
  const myId = idStr(user?._id ?? user?.id);

  const [liked, setLiked] = useState(() => {
    if (!post) return false;
    if (typeof post.liked === "boolean") return post.liked;
    return Array.isArray(post.likes) ? post.likes.includes(myId) : false;
  });
  const [likeCount, setLikeCount] = useState(() => {
    if (!post) return 0;
    if (typeof post.likes === "number") return post.likes;
    return Array.isArray(post.likes) ? post.likes.length : 0;
  });
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [comments, setComments] = useState(() =>
    (post?.comments ?? []).map((c) => mapComment(c, myId)),
  );
  const [deleting, setDeleting] = useState(false);
  // Diálogo de confirmação in-app: { title, message, confirmLabel, onConfirm } | null
  const [confirm, setConfirm] = useState(null);

  const isOwner = !!post && !!myId && idStr(post.user_id) === myId;

  const [following, setFollowing] = useState(
    () => !!post && (user?.following ?? []).includes(post.user_id),
  );
  const [followLoading, setFollowLoading] = useState(false);

  const handleFollow = async () => {
    if (!post || followLoading) return;
    setFollowLoading(true);
    setFollowing((f) => !f);
    try {
      const res = await followUser(token, post.user_id);
      if (typeof res?.is_following === "boolean") setFollowing(res.is_following);
      if (Array.isArray(res?.following)) updateUser({ following: res.following });
    } catch {
      setFollowing((f) => !f);
    } finally {
      setFollowLoading(false);
    }
  };

  const goToProfile = () => {
    if (!post?.user_id) return;
    navigate(isOwner ? "/profile" : `/users/${post.user_id}`);
  };

  const handleEdit = () => {
    navigate("/social/new", { state: { editPost: post } });
  };

  // Abre o pop-up de confirmação para eliminar o post.
  const handleDelete = () => {
    if (!post) return;
    setConfirm({
      title: "Eliminar publicação",
      message: "Tens a certeza? Esta ação não pode ser revertida.",
      confirmLabel: "Eliminar",
      onConfirm: doDeletePost,
    });
  };

  const doDeletePost = async () => {
    if (!post || deleting) return;
    setDeleting(true);
    try {
      await deletePost(token, post.id);
      navigate("/social");
    } catch {
      setDeleting(false);
    }
  };

  const handleLike = async () => {
    if (!post) return;
    setLiked((l) => !l);
    setLikeCount((c) => c + (liked ? -1 : 1));
    try {
      const res = await likePost(token, post.id);
      if (typeof res?.liked === "boolean") setLiked(res.liked);
      if (typeof res?.likes === "number") setLikeCount(res.likes);
    } catch {
      setLiked((l) => !l);
      setLikeCount((c) => c + (liked ? 1 : -1));
    }
  };

  const handleAddComment = async (text) => {
    if (!post) return;
    try {
      const created = await addComment(token, post.id, text);
      setComments((list) => [...list, mapComment(created, myId)]);
    } catch {
      // mantém o comentário por enviar; o utilizador pode tentar de novo
    }
  };

  const handleReply = async (parentId, text) => {
    if (!post) return;
    try {
      const created = await addComment(token, post.id, text, parentId);
      setComments((list) => [...list, mapComment(created, myId)]);
    } catch {
      // ignora; o utilizador pode tentar de novo
    }
  };

  const handleEditComment = async (commentId, newText) => {
    if (!post) return;
    const prev = comments;
    setComments((list) =>
      list.map((c) => (c.id === commentId ? { ...c, text: newText } : c)),
    );
    try {
      await updateComment(token, post.id, commentId, newText);
    } catch {
      setComments(prev);
    }
  };

  // Abre o pop-up de confirmação para eliminar um comentário.
  const handleDeleteComment = (commentId) => {
    setConfirm({
      title: "Eliminar comentário",
      message: "Eliminar este comentário? As respostas também são removidas.",
      confirmLabel: "Eliminar",
      onConfirm: () => doDeleteComment(commentId),
    });
  };

  const doDeleteComment = async (commentId) => {
    if (!post) return;
    const prev = comments;
    // Otimista: remove o comentário e, em cascata, as respostas.
    setComments((list) =>
      list.filter((c) => c.id !== commentId && c.parent_id !== commentId),
    );
    try {
      await deleteComment(token, post.id, commentId);
    } catch {
      setComments(prev);
    }
  };

  const handleLikeComment = async (commentId) => {
    if (!post) return;
    const prev = comments;
    setComments((list) =>
      list.map((c) =>
        c.id === commentId
          ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) }
          : c,
      ),
    );
    try {
      const res = await likeComment(token, post.id, commentId);
      setComments((list) =>
        list.map((c) =>
          c.id === commentId
            ? {
                ...c,
                liked: typeof res?.liked === "boolean" ? res.liked : c.liked,
                likes: typeof res?.likes === "number" ? res.likes : c.likes,
              }
            : c,
        ),
      );
    } catch {
      setComments(prev);
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
      <div className="relative w-full h-[400px] flex-shrink-0">
        <img src={images[activeImage]} alt={title} className="w-full h-full object-cover" />
        <div className="absolute left-4 top-4">
          <BackButton />
        </div>
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-1.5">
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
            onClick={() => navigate("/map", { state: { gpxPoints, gpxUrl, gpxTitle: title } })}
            className="absolute right-4 bottom-8 h-10 px-5 rounded-2xl bg-primary-soft text-white text-sm font-semibold shadow-primary-button backdrop-blur-[2px] active:scale-95"
          >
            Ver no mapa
          </button>
        )}
      </div>

      <article className="flex-1 -mt-4 rounded-t-2xl bg-white relative z-10 px-4 pt-6 pb-8 shadow-top-sheet">
        <header className="flex items-center gap-3 mb-5">
          <div
            onClick={goToProfile}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") goToProfile();
            }}
            className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E6A45A] bg-primary-soft flex items-center justify-center text-white font-bold cursor-pointer"
          >
            {avatar ? (
              <img src={avatar} alt={username} className="w-full h-full object-cover" />
            ) : (
              username.charAt(0).toUpperCase()
            )}
          </div>
          <div className="flex flex-col gap-px min-w-0">
            <span
              onClick={goToProfile}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") goToProfile();
              }}
              className="text-sm font-semibold text-dark cursor-pointer hover:underline truncate w-fit"
            >
              {username}
            </span>
            <span className="text-[13px] text-dark/70">{[date, location].filter(Boolean).join(" · ")}</span>
          </div>
          {!isOwner && post?.user_id && (
            <button
              type="button"
              onClick={handleFollow}
              disabled={followLoading}
              className={`ml-auto shrink-0 h-8 px-4 rounded-full text-[13px] font-semibold transition-colors active:scale-95 disabled:opacity-50 ${
                following
                  ? "bg-white text-dark border border-divider"
                  : "bg-primary text-white shadow-primary-button"
              }`}
            >
              {following ? "A seguir" : "Seguir"}
            </button>
          )}
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

        <h2 className="text-lg font-bold mb-2 text-dark">{title}</h2>
        <p className="text-sm leading-relaxed mb-6 text-dark/80">{description}</p>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleLike}
            className="flex items-center gap-2 p-1 active:scale-90"
            aria-label={liked ? "Não gostar" : "Gostar"}
          >
            <HeartIcon filled={liked} size={25} />
            {likeCount > 0 && (
              <span className="text-sm font-semibold text-dark/80">{likeCount}</span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setCommentsOpen(true)}
            className="flex items-center gap-2 p-1 active:scale-90"
            aria-label="Ver comentários"
          >
            <CommentIcon size={24} />
            {comments.length > 0 && (
              <span className="text-sm font-semibold text-dark/80">{comments.length}</span>
            )}
          </button>
        </div>
      </article>

      <CommentsSheet
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        comments={comments}
        onAddComment={handleAddComment}
        onEditComment={handleEditComment}
        onDeleteComment={handleDeleteComment}
        onLikeComment={handleLikeComment}
        onReply={handleReply}
        onOpenProfile={(uid) => navigate(`/users/${uid}`)}
        meId={myId}
        isPostOwner={isOwner}
        meAvatar={user?.photo_url ?? null}
        meName={user?.username ?? ""}
      />

      <ConfirmDialog
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        confirmLabel={confirm?.confirmLabel}
        onConfirm={() => {
          const action = confirm?.onConfirm;
          setConfirm(null);
          action?.();
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}
