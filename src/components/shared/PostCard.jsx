import { COLORS, SHADOWS, FONTS } from "../../constants/theme.js";
import { IMAGES } from "../../constants/images.js";
import { HeartIcon, CommentIcon, BookmarkIcon } from "../ui/Icons.jsx";

export function FeedPostCard({ post, onToggleLike, onToggleSave, onOpenComments }) {
  return (
    <article className="pb-2">
      <div className="flex items-center gap-3 px-4 pb-2.5">
        <img
          src={post.avatar}
          alt={post.username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0"
          style={{ border: "2px solid #E6A45A" }}
        />
        <div className="flex flex-col gap-px">
          <span className="text-sm" style={{ color: COLORS.dark }}>{post.username}</span>
          <span className="text-xs" style={{ color: "rgba(14,44,56,0.7)" }}>
            {post.date} · {post.location}
          </span>
        </div>
      </div>
      <div className="px-4">
        <div className="relative">
          <img
            src={post.image}
            alt={post.title}
            className="w-full h-[300px] rounded-2xl object-cover"
          />
          {post.route && (
            <div
              className="absolute bottom-4 left-4 flex rounded-lg overflow-hidden"
              style={{ background: "rgba(0,0,0,0.47)", backdropFilter: "blur(1px)" }}
            >
              <div className="flex flex-col items-center px-3.5 py-2.5 gap-0.5">
                <span className="text-[10px] text-white/80">Distância</span>
                <span className="text-xs font-bold text-white">{post.route.distance}</span>
              </div>
              <div className="w-px bg-white/30 my-2" />
              <div className="flex flex-col items-center px-3.5 py-2.5 gap-0.5">
                <span className="text-[10px] text-white/80">Duração</span>
                <span className="text-xs font-bold text-white">{post.route.duration}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="px-4 pt-2.5">
        <h3 className="text-base font-bold mb-1" style={{ color: COLORS.dark }}>{post.title}</h3>
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: "rgba(14,44,56,0.8)" }}
        >
          {post.description}
        </p>
      </div>
      <div className="flex items-center gap-3.5 px-4 pt-2.5 pb-1">
        <button
          type="button"
          onClick={() => onToggleLike?.(post.id)}
          className="p-1 active:scale-90"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <HeartIcon filled={post.liked} size={22} />
        </button>
        <button
          type="button"
          onClick={() => onOpenComments?.(post.id)}
          className="p-1"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <CommentIcon size={22} />
        </button>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => onToggleSave?.(post.id)}
          className="p-1 active:scale-90"
          style={{ background: "none", border: "none", cursor: "pointer" }}
        >
          <BookmarkIcon filled={post.saved} size={22} />
        </button>
      </div>
    </article>
  );
}

export function ProfilePostCard({ post, onToggleLike }) {
  return (
    <article
      className="rounded-2xl overflow-hidden bg-white"
      style={{ boxShadow: SHADOWS.card }}
    >
      <div className="w-full h-[220px] overflow-hidden">
        <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
      </div>
      <div className="px-4 pt-3 pb-1">
        <h3
          className="text-base font-bold mb-1"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
        >
          {post.title}
        </h3>
        <p
          className="text-xs leading-relaxed line-clamp-2"
          style={{ color: "rgba(14,44,56,0.75)", fontFamily: FONTS.manrope }}
        >
          {post.description}
        </p>
      </div>
      <div
        className="flex items-center gap-4 px-4 py-3 mt-1"
        style={{ borderTop: "1px solid #f0f0f0" }}
      >
        <button
          type="button"
          onClick={() => onToggleLike?.(post.id)}
          className="flex items-center gap-1.5 active:scale-90"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: post.liked ? COLORS.primary : COLORS.dark,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <HeartIcon filled={post.liked} size={20} />
          <span>{post.likes}</span>
        </button>
        <button
          type="button"
          className="flex items-center gap-1.5"
          style={{
            fontSize: "12px",
            fontWeight: 600,
            color: COLORS.dark,
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          <img src={IMAGES.icons.messages} alt="" className="w-[22px] h-[22px]" />
          <span>{post.comments}</span>
        </button>
      </div>
    </article>
  );
}
