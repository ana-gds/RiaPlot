import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { BackButton } from "../components/ui/BackButton.jsx";
import { FeedPostCard } from "../components/shared/PostCard.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getUser, getPosts, followUser, likePost, blockUser } from "../services/api.js";

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
  const [requested, setRequested] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false);
  const [hideFollowers, setHideFollowers] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [confirmBlock, setConfirmBlock] = useState(false);

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
        setFollowing(!!data.is_following);
        setRequested(!!data.requested);
        setIsPrivate(!!data.is_private);
        setHideFollowers(!!data.hide_followers);
      })
      .catch((err) => {
        if (!cancelled && err?.unavailable) setUnavailable(true);
      });
    return () => { cancelled = true; };
  }, [token, id]);

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
              avatar: p.photo_url ?? null,
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
    try {
      const res = await followUser(token, id);
      if (res?.status === "requested") {
        setRequested(true);
      } else if (res?.status === "cancelled") {
        setRequested(false);
      } else {
        setRequested(false);
        setFollowing(!!res?.is_following);
        if (typeof res?.followers_count === "number") setFollowerCount(res.followers_count);
        if (Array.isArray(res?.following)) updateUser({ following: res.following });
      }
    } catch {
      // mantém o estado atual
    } finally {
      setFollowLoading(false);
    }
  };

  const handleBlock = async () => {
    try {
      await blockUser(token, id);
    } catch {
      // ignora; segue para trás de qualquer forma
    }
    setConfirmBlock(false);
    navigate(-1);
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

  if (unavailable) {
    return (
      <>
        <div className="px-4 pt-2 pb-3">
          <BackButton />
        </div>
        <div className="flex flex-col items-center justify-center flex-1 px-6 text-center">
          <p className="text-sm font-semibold text-dark">Perfil indisponível</p>
          <p className="text-xs mt-1 text-muted">Não é possível ver este perfil.</p>
        </div>
      </>
    );
  }

  const name = profile?.name ?? "";
  const username = profile?.username ?? "";
  const photo = profile?.photo_url ?? null;
  const bio = profile?.bio ?? null;
  const followingCount = (profile?.following ?? []).length;

  const followLabel = following ? "A seguir" : requested ? "Pedido enviado" : "Seguir";
  const followNeutral = following || requested;
  // Conta privada que não sigo: esconde as publicações.
  const locked = isPrivate && !following && !isMe;

  return (
    <>
      <div className="px-4 pt-2 pb-3 flex items-center justify-between">
        <BackButton />
        {!isMe && (
          <button
            type="button"
            onClick={() => setConfirmBlock(true)}
            className="w-9 h-9 rounded-full flex items-center justify-center text-dark/60 hover:bg-dark/5 active:scale-90"
            aria-label="Bloquear utilizador"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              <path d="M5.6 5.6l12.8 12.8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
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
        <h1 className="text-xl font-bold mt-3 text-dark">{name}</h1>
        <p className="text-[11px] text-dark/60">@{username}</p>
        <div className="flex items-center gap-12 mt-3 mb-4">
          <StatItem value={posts.length} label="Posts" />
          <StatItem value={hideFollowers ? "—" : followerCount} label="Seguidores" />
          <StatItem value={hideFollowers ? "—" : followingCount} label="Seguindo" />
        </div>
        {bio && (
          <p className="mb-4 max-w-[320px] text-center text-sm leading-snug text-dark/80 whitespace-pre-line">
            {bio}
          </p>
        )}
        {!isMe && (
          <button
            type="button"
            onClick={handleFollow}
            disabled={followLoading}
            className={`px-6 py-2.5 rounded-2xl text-[15px] font-semibold active:scale-95 mb-2 disabled:opacity-50 ${
              followNeutral
                ? "bg-dark/5 text-dark"
                : "bg-primary text-white shadow-primary-button"
            }`}
            style={{ width: 138 }}
          >
            {followLabel}
          </button>
        )}
      </div>

      <div className="border-b border-divider/70 mt-4" />

      <div className="py-4">
        {locked ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" className="mb-3" aria-hidden="true">
              <rect x="4" y="11" width="16" height="9" rx="2" stroke="var(--color-muted-soft)" strokeWidth="2" />
              <path d="M8 11V8a4 4 0 0 1 8 0v3" stroke="var(--color-muted-soft)" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <p className="text-sm font-semibold text-dark">Esta conta é privada</p>
            <p className="text-xs mt-1 text-muted">Segue esta conta para veres as publicações.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-12 px-4 text-muted">
            <p className="text-sm">A carregar…</p>
          </div>
        ) : posts.length > 0 ? (
          <div className="flex flex-col gap-4 md:max-w-xl md:mx-auto">
            {posts.map((p) => (
              <FeedPostCard
                key={p.id}
                post={p}
                onToggleLike={toggleLike}
                onOpenComments={() => navigate("/social/post", { state: { post: p } })}
                onOpenDetail={() => navigate("/social/post", { state: { post: p } })}
                onOpenProfile={(uid) => navigate(`/users/${uid}`)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 px-4 text-muted">
            <p className="text-sm font-medium">Ainda sem publicações</p>
            <p className="text-xs mt-1">Este utilizador ainda não partilhou nada.</p>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmBlock}
        title="Bloquear utilizador"
        message={`Bloquear @${username}? Deixam de poder ver o teu perfil e de interagir contigo, e deixam de se seguir mutuamente.`}
        confirmLabel="Bloquear"
        onConfirm={handleBlock}
        onCancel={() => setConfirmBlock(false)}
      />
    </>
  );
}
