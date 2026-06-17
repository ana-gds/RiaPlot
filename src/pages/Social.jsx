import { useEffect, useMemo, useState } from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { CircularButton } from "../components/ui/Button.jsx";
import { MenuIcon, PlusIcon, CommentIcon, FilterIcon } from "../components/ui/Icons.jsx";
import { Chip } from "../components/ui/Chip.jsx";
import { SearchBar } from "../components/shared/SearchBar.jsx";
import { FeedPostCard } from "../components/shared/PostCard.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getPosts, getUsers, likePost } from "../services/api.js";

function formatDate(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("pt-PT", { day: "2-digit", month: "2-digit" });
}

// Normaliza um id para string (lida com ids embrulhados, ex.: { $oid }).
function idStr(v) {
  if (v == null) return null;
  if (typeof v === "object") return v.$oid ?? String(v);
  return String(v);
}

// Ícones das tabs (herdam a cor do texto da tab via currentColor).
function PostsTabIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth={active ? 2.2 : 2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  );
}

function UsersTabIcon({ active }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth={active ? 2.2 : 2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

// Ícones pequenos (12px) para as chips de filtro — herdam a cor via currentColor.
function ClockChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function HeartChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  );
}

function PeopleChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function AzChipIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M7 4v15m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 6h7M13 11h5M13 16h3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Quantos posts pedir ao servidor de cada vez.
const PAGE_SIZE = 10;

function LoadingState() {
  return (
    <div className="flex items-center justify-center py-16">
      <span className="text-sm text-muted">A carregar…</span>
    </div>
  );
}

// Mapeia um post enriquecido da API para a forma usada pelo FeedPostCard.
function mapPost(p, myId) {
  return {
    id: p.id ?? p._id,
    user_id: p.user_id,
    username: p.username ?? "unknown",
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
    createdAt: p.created_at ?? null,
    comments: p.comments ?? [],
    liked: (p.likes ?? []).includes(myId),
    likes: (p.likes ?? []).length,
    commentCount: (p.comments ?? []).length,
  };
}

export default function Social() {
  const navigate = useNavigate();
  const { openSidebar } = useOutletContext();
  const { user, token } = useAuth();
  const myId = user?._id ?? user?.id;
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [mode, setMode] = useState("posts"); // "posts" | "users"
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filtros / ordenação.
  const [showFilters, setShowFilters] = useState(false);
  const [postSort, setPostSort] = useState("recent"); // "recent" | "old" | "liked"
  const [postFollowing, setPostFollowing] = useState(false); // só de quem sigo
  const [userAZ, setUserAZ] = useState(false); // ordenar utilizadores A-Z
  const [userFollowing, setUserFollowing] = useState(false); // só quem sigo

  // Ids de quem o utilizador segue (para os filtros "de quem sigo").
  const followingSet = useMemo(
    () => new Set((user?.following ?? []).map(idStr)),
    [user?.following],
  );

  // Nº de filtros ativos (≠ predefinição) no modo atual, para o badge.
  const activeFilterCount =
    mode === "posts"
      ? (postSort !== "recent" ? 1 : 0) + (postFollowing ? 1 : 0)
      : (userAZ ? 1 : 0) + (userFollowing ? 1 : 0);

  // Primeira página do feed. Recarrega quando muda a ordenação ou o filtro
  // "de quem sigo" (a filtragem/ordenação é feita no servidor).
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setPostsLoading(true);
    getPosts(token, { page: 1, perPage: PAGE_SIZE, sort: postSort, following: postFollowing })
      .then((res) => {
        if (cancelled) return;
        setPosts((res.data ?? []).map((p) => mapPost(p, myId)));
        setPage(res.current_page ?? 1);
        setLastPage(res.last_page ?? 1);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPostsLoading(false);
      });
    return () => { cancelled = true; };
  }, [token, myId, postSort, postFollowing]);

  // Carrega a página seguinte e acrescenta ao feed.
  const loadMore = async () => {
    if (loadingMore || page >= lastPage) return;
    setLoadingMore(true);
    try {
      const res = await getPosts(token, {
        page: page + 1,
        perPage: PAGE_SIZE,
        sort: postSort,
        following: postFollowing,
      });
      setPosts((prev) => [...prev, ...(res.data ?? []).map((p) => mapPost(p, myId))]);
      setPage(res.current_page ?? page + 1);
      setLastPage(res.last_page ?? lastPage);
    } catch {
      // mantém o que já está carregado
    } finally {
      setLoadingMore(false);
    }
  };

  const toggleLike = async (id) => {
    // Atualização otimista da contagem e do estado.
    setPosts((p) =>
      p.map((x) =>
        x.id === id
          ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
          : x,
      ),
    );
    try {
      const res = await likePost(token, id);
      // Reconcilia com a verdade do servidor (contagem e estado).
      setPosts((p) =>
        p.map((x) =>
          x.id === id
            ? {
                ...x,
                liked: typeof res?.liked === "boolean" ? res.liked : x.liked,
                likes: typeof res?.likes === "number" ? res.likes : x.likes,
              }
            : x,
        ),
      );
    } catch {
      // Reverte (voltar a aplicar o mesmo toggle desfaz o otimista).
      setPosts((p) =>
        p.map((x) =>
          x.id === id
            ? { ...x, liked: !x.liked, likes: x.likes + (x.liked ? -1 : 1) }
            : x,
        ),
      );
    }
  };

  // A ordenação e o filtro "de quem sigo" são feitos no servidor. Aqui só se
  // aplica a pesquisa por texto, sobre os posts já carregados.
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) => p.title?.toLowerCase().includes(q) || p.username.toLowerCase().includes(q),
    );
  }, [posts, search]);

  // Utilizadores depois de aplicar filtro "quem sigo" e ordenação A-Z.
  const visibleUsers = useMemo(() => {
    let list = userFollowing
      ? users.filter((u) => followingSet.has(idStr(u.user_id)))
      : users;
    if (userAZ) {
      list = [...list].sort((a, b) =>
        (a.username ?? "").localeCompare(b.username ?? "", "pt", { sensitivity: "base" }),
      );
    }
    return list;
  }, [users, userFollowing, userAZ, followingSet]);

  // Pesquisa de utilizadores no servidor (debounced). Só corre no modo
  // "users"; o backend filtra por nome/username via `?q=`.
  useEffect(() => {
    if (mode !== "users") return;
    let cancelled = false;
    setUsersLoading(true);
    const t = setTimeout(() => {
      getUsers(token, search.trim())
        .then((data) => {
          if (cancelled) return;
          setUsers(
            data.map((u) => ({
              user_id: u.id,
              username: u.username,
              name: u.name ?? "",
              avatar: u.photo_url ?? null,
            })),
          );
        })
        .catch(() => {
          if (!cancelled) setUsers([]);
        })
        .finally(() => {
          if (!cancelled) setUsersLoading(false);
        });
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [mode, search, token]);

  const handleSearch = (v) => setSearch(v);

  const handleMode = (next) => {
    // Evita o flash do estado vazio: marca o carregamento já na troca de tab,
    // antes de o efeito de pesquisa correr.
    if (next === "users" && mode !== "users") setUsersLoading(true);
    setMode(next);
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 px-4 pb-0 flex-shrink-0 sticky top-0 bg-white z-10">
        <div className="flex items-center gap-3">
          <CircularButton onClick={openSidebar} ariaLabel="Menu" className="md:hidden">
            <MenuIcon />
          </CircularButton>
          <h1 className="hidden md:block text-xl font-bold text-dark shrink-0">Social</h1>
          <SearchBar
            value={search}
            onChange={handleSearch}
            onClear={() => handleSearch("")}
            placeholder={mode === "users" ? "Procura um utilizador" : "Procura um post"}
          />
          <button
            type="button"
            onClick={() => setShowFilters((s) => !s)}
            className={[
              "w-12 h-12 rounded-full flex items-center justify-center shrink-0 relative border transition-all",
              showFilters || activeFilterCount > 0
                ? "bg-primary/10 border-primary text-primary shadow-[0_6px_22px_rgba(219,139,49,0.22)]"
                : "bg-cream border-primary/20 text-dark hover:border-primary/40 shadow-[0_2px_10px_rgba(0,77,108,0.05)]",
            ].join(" ")}
            aria-label="Mostrar filtros"
            aria-expanded={showFilters}
          >
            <FilterIcon color="currentColor" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center bg-primary text-white text-[10px] font-bold border-2 border-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
        <div className="relative flex w-full border-b border-secondary/10">
          {[
            { key: "posts", label: "Publicações", icon: PostsTabIcon },
            { key: "users", label: "Utilizadores", icon: UsersTabIcon },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = mode === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => handleMode(tab.key)}
                aria-pressed={active}
                className={`flex-1 flex items-center justify-center gap-2 h-11 text-sm font-semibold transition-colors ${
                  active ? "text-primary" : "text-muted hover:text-dark"
                }`}
              >
                <Icon active={active} />
                {tab.label}
              </button>
            );
          })}
          {/* Sublinhado que desliza para a tab ativa. */}
          <span
            aria-hidden="true"
            className="absolute bottom-0 left-0 h-[2.5px] w-1/2 rounded-full bg-primary transition-transform duration-300 ease-out"
            style={{ transform: mode === "users" ? "translateX(100%)" : "translateX(0)" }}
          />
        </div>

        {showFilters && (
          <div className="flex gap-2 overflow-x-auto -mx-4 px-4 pt-3 pb-1 scroll-x-hidden">
            {mode === "posts" ? (
              <>
                <Chip
                  active={postSort === "recent"}
                  onClick={() => setPostSort("recent")}
                  icon={<ClockChipIcon />}
                >
                  Mais recentes
                </Chip>
                <Chip active={postSort === "old"} onClick={() => setPostSort("old")}>
                  Mais antigas
                </Chip>
                <Chip
                  active={postSort === "liked"}
                  onClick={() => setPostSort("liked")}
                  icon={<HeartChipIcon />}
                >
                  Mais gostadas
                </Chip>
                <Chip
                  active={postFollowing}
                  onClick={() => setPostFollowing((v) => !v)}
                  icon={<PeopleChipIcon />}
                >
                  De quem sigo
                </Chip>
              </>
            ) : (
              <>
                <Chip
                  active={userAZ}
                  onClick={() => setUserAZ((v) => !v)}
                  icon={<AzChipIcon />}
                >
                  A-Z
                </Chip>
                <Chip
                  active={userFollowing}
                  onClick={() => setUserFollowing((v) => !v)}
                  icon={<PeopleChipIcon />}
                >
                  Quem sigo
                </Chip>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pt-2 pb-4">
        <div className="w-full md:max-w-xl md:mx-auto">
          {mode === "users" ? (
            usersLoading && users.length === 0 ? (
              <LoadingState />
            ) : visibleUsers.length > 0 ? (
              <ul className="px-2">
                {visibleUsers.map((u) => (
                  <li key={u.user_id ?? u.username}>
                    <button
                      type="button"
                      onClick={() => u.user_id && navigate(`/users/${u.user_id}`)}
                      className="w-full flex items-center gap-3 px-2 py-2.5 rounded-2xl hover:bg-cream transition-colors text-left"
                    >
                      {u.avatar ? (
                        <img
                          src={u.avatar}
                          alt={u.username}
                          className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-[#E6A45A]"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-[#E6A45A] bg-primary-soft flex items-center justify-center text-white font-bold">
                          {u.username?.charAt(0)?.toUpperCase() ?? "?"}
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold text-dark">{u.username}</span>
                        {u.name && <span className="text-xs text-muted">{u.name}</span>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <CommentIcon size={48} color="var(--color-muted-soft)" className="mb-3" />
                <p className="text-sm font-semibold text-dark">Sem utilizadores</p>
                <p className="text-xs mt-1 text-muted">
                  {userFollowing
                    ? "Não segues utilizadores que apareçam aqui."
                    : search.trim()
                      ? "Não encontrámos utilizadores com esse nome."
                      : "Ainda não há utilizadores para mostrar."}
                </p>
              </div>
            )
          ) : postsLoading && posts.length === 0 ? (
            <LoadingState />
          ) : filtered.length > 0 ? (
            <>
              {filtered.map((post, i) => (
                <div key={post.id} className={i > 0 ? "mt-4" : ""}>
                  <FeedPostCard
                    post={post}
                    onToggleLike={toggleLike}
                    onOpenDetail={() => navigate("/social/post", { state: { post } })}
                    onOpenComments={() => navigate("/social/post", { state: { post } })}
                    onOpenProfile={(uid) => navigate(`/users/${uid}`)}
                  />
                </div>
              ))}

              {/* "Carregar mais" só quando não há pesquisa ativa (a pesquisa é
                  feita sobre os posts já carregados). */}
              {!search.trim() && page < lastPage && (
                <div className="flex flex-col items-center gap-2 mt-4 mb-2">
                  <button
                    type="button"
                    onClick={loadMore}
                    disabled={loadingMore}
                    className="h-11 px-6 rounded-2xl bg-primary text-white text-sm font-semibold shadow-primary-button active:scale-95 disabled:opacity-60"
                  >
                    {loadingMore ? "A carregar…" : "Carregar mais"}
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <CommentIcon size={48} color="var(--color-muted-soft)" className="mb-3" />
              <p className="text-sm font-semibold text-dark">Sem publicações</p>
              <p className="text-xs mt-1 text-muted">
                {postFollowing
                  ? "Sem publicações de quem segues por aqui."
                  : "Sê o primeiro a partilhar uma aventura!"}
              </p>
            </div>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={() => navigate("/social/new")}
        className="fixed right-6 z-30 w-14 h-14 rounded-full flex items-center justify-center bg-primary shadow-primary-fab active:scale-90 transition-transform bottom-[calc(72px+16px)] md:bottom-6"
        aria-label="Criar post"
      >
        <PlusIcon />
      </button>
    </>
  );
}