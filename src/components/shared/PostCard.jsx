import { HeartIcon, CommentIcon } from "../ui/Icons.jsx";

export function FeedPostCard({
  post,
  onToggleLike,
  onOpenComments,
  onOpenDetail,
  onOpenProfile,
}) {
  const openProfile = () => post.user_id && onOpenProfile?.(post.user_id);
  return (
    <article className="pb-2">
      <div className="flex items-center gap-3 px-4 pb-2.5">
        {post.avatar ? (
          <img
            src={post.avatar}
            alt={post.username}
            onClick={openProfile}
            loading="lazy"
            decoding="async"
            className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#E6A45A] cursor-pointer"
          />
        ) : (
          <div
            onClick={openProfile}
            className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-[#E6A45A] bg-primary-soft flex items-center justify-center text-white font-bold cursor-pointer"
          >
            {post.username?.charAt(0)?.toUpperCase() ?? "?"}
          </div>
        )}
        <div className="flex flex-col gap-px">
          <span
            onClick={openProfile}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openProfile();
            }}
            className="text-sm text-dark cursor-pointer hover:underline w-fit"
          >
            {post.username}
          </span>
          <span className="text-xs text-dark/70">
            {post.date} · {post.location}
          </span>
        </div>
      </div>

      <div className="px-4">
        <div
          className="relative cursor-pointer overflow-hidden rounded-2xl"
          role="button"
          tabIndex={0}
          onClick={() => onOpenDetail?.(post.id)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") onOpenDetail?.(post.id);
          }}
        >
          <img
            src={post.image}
            alt={post.title}
            loading="lazy"
            decoding="async"
            className="block w-full h-[300px] object-cover"
          />
        </div>
      </div>

      <div
        className="px-4 pt-2.5 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onOpenDetail?.(post.id)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") onOpenDetail?.(post.id);
        }}
      >
        <h3 className="text-base font-bold mb-1 text-dark">{post.title}</h3>
        <p className="text-[13px] leading-relaxed text-dark/80 line-clamp-2">{post.description}</p>
      </div>

      <div className="flex items-center gap-3.5 px-4 pt-2.5 pb-1">
        <button
          type="button"
          onClick={() => onToggleLike?.(post.id)}
          className="flex items-center gap-1.5 p-1 active:scale-90"
          aria-label={post.liked ? "Não gostar" : "Gostar"}
        >
          <HeartIcon filled={post.liked} size={22} />
          {post.likes > 0 && (
            <span className="text-xs font-semibold text-dark/80">{post.likes}</span>
          )}
        </button>
        <button
          type="button"
          onClick={() => onOpenComments?.(post.id)}
          className="flex items-center gap-1.5 p-1"
          aria-label="Ver comentários"
        >
          <CommentIcon size={22} />
          {post.commentCount > 0 && (
            <span className="text-xs font-semibold text-dark/80">{post.commentCount}</span>
          )}
        </button>
      </div>
    </article>
  );
}
