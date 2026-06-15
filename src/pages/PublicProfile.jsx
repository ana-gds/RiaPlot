import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { ProfilePostCard } from "../components/shared/PostCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUser, getPosts, followUser, likePost } from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

function StatItem({ value, label }) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-dark">{value}</span>
      <span className="text-xs text-dark/70">{label}</span>
    </div>
  );
}

export default function PublicProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token, updateUser } = useAuth();

  const myId = user?._id ?? user?.id;
  const isMe = !!myId && myId === id;

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // Se for o próprio utilizador, vai para o perfil pessoal.
  useEffect(() => {
    if (isMe) navigate("/profile", { replace: true });
  }, [isMe, navigate]);

  useEffect(() => {
    if (!token || !id) return;
    let cancelled = false;
    getUser(token, id)
      .then((data) => {
        if (cancelled) return;
        setProfile(data);
        setFollowerCount((data.followers ?? []).length);
        setFollowing((user?.following ?? []).includes(id));
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [token, id, user]);

  useEffect(() => {
    if (!token || !id) return;
    let cancelled = false;
    getPosts(token, { userId: id, perPage: 50 })
      .then((res) => {
        if (cancelled) return;
        setPosts(
          (res.data ?? [])
            .map((p) => ({
              id: p.id ?? p._id,
              user_id: p.user_id,
              username: p.username ?? "",
              photo_url: p.photo_url ?? null,
              date: formatDate(p.created_at),
              location: p.location ?? "",
              image: p.post_url?.[0] ?? IMAGES.posts.feed1,
              images: p.post_url ?? [],
              gpxUrl: p.gpx_url ?? null,
              gpxPoints: p.gpx_points ?? null,
              route_doc: p.route_doc ?? "",
              title: p.title,
              description: p.description,
              comments: p.comments ?? [],
              liked: (p.likes ?? []).includes(myId),
              likes: (p.likes ?? []).length,
              commentCount: (p.comments ?? []).length,
            })),
        );
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [token, id, myId]);

  const handleFollow = async () => {
    if (followLoading) return;
    setFollowLoading(true);
    setFollowing((f) => !f);
    setFollowerCount((c) => c + (following ? -1 : 1));
    try {
      const res = await followUser(token, id);
      if (typeof res?.is_following === "boolean") setFollowing(res.is_following);
      if (typeof res?.followers_count === "number") setFollowerCount(res.followers_count);
      if (Array.isArray(res?.following)) updateUser({ following: res.following });
    } catch {
      setFollowing((f) => !f);
      setFollowerCount((c) => c + (following ? 1 : -1));
    } finally {
      setFollowLoading(false);
    }
  };

  const toggleLike = async (postId) => {
    setPosts((p) =>
      p.map((x) =>
        x.id === postId
          ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
          : x,
      ),
    );
    try {
      const res = await likePost(token, postId);
      setPosts((p) =>
        p.map((x) =>
          x.id === postId
            ? {
                ...x,
                liked: typeof res?.liked === "boolean" ? res.liked : x.liked,
                likes: typeof res?.likes === "number" ? res.likes : x.likes,
              }
            : x,
        ),
      );
    } catch {
      setPosts((p) =>
        p.map((x) =>
          x.id === postId
            ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
            : x,
        ),
      );
    }
  };

  const name = profile?.name ?? "";
  const username = profile?.username ?? "";
  const photo = profile?.photo_url ?? null;
  const followingCount = (profile?.following ?? []).length;

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton />
      </div>

      <div className="flex flex-col items-center px-4 gap-1">
        <div className="w-[100px] h-[100px] rounded-full overflow-hidden border-[3px] border-primary shadow-[0_4px_16px_rgba(219,139,49,0.3)]">
          {photo ? (
            <img src={photo} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-primary-soft text-white text-3xl font-bold">
              {name?.charAt(0)?.toUpperCase() ?? "?"}
            </div>
          )}
        </div>
        <h1 className="text-xl font-bold mt-3 text-dark font-inter">{name}</h1>
        <p className="text-[11px] text-dark/60">@{username}</p>
        <div className="flex items-center gap-12 mt-3 mb-4">
          <StatItem value={posts.length} label="Posts" />
          <StatItem value={followerCount} label="Seguidores" />
          <StatItem value={followingCount} label="Seguindo" />
        </div>
        {!isMe && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-6 py-2.5 rounded-2xl text-[15px] font-semibold active:scale-95 mb-2 disabled:opacity-50 ${
              following
                ? "bg-dark/5 text-dark"
                : "bg-primary text-white shadow-primary-button"
            }`}
            style={{ width: 138 }}
          >
            {following ? "A seguir" : "Seguir"}
          </button>
        )}
      </div>

      <div className="border-b border-divider/70 mt-4" />

      <div className="px-4 py-4 flex flex-col gap-4">
        {loading ? (
          <div className="text-center py-12 text-muted">
            <p className="text-sm">A carregar…</p>
          </div>
        ) : posts.length > 0 ? (
          posts.map((p) => (
            <ProfilePostCard
              key={p.id}
              post={p}
              onToggleLike={toggleLike}
              onOpenDetail={() => navigate("/social/post", { state: { post: p } })}
            />
          ))
        ) : (
          <div className="text-center py-12 text-muted">
            <p className="text-sm font-medium">Ainda sem publicações</p>
            <p className="text-xs mt-1">Este utilizador ainda não partilhou nada.</p>
          </div>
        )}
      </div>
    </>
  );
}
