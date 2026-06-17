import { useEffect, useState } from "react";
import { BackButton } from "../components/ui/BackButton.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import {
  updateUser,
  getFollowRequests,
  acceptFollowRequest,
  rejectFollowRequest,
  getBlocked,
  blockUser,
} from "../services/api.js";

function Switch({ checked, onChange, disabled }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-colors ${
        checked ? "bg-primary" : "bg-divider"
      } ${disabled ? "opacity-50" : "active:scale-95"}`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : ""
        }`}
      />
    </button>
  );
}

function ToggleRow({ title, desc, checked, onChange, disabled }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-divider bg-white px-4 py-3.5">
      <div className="flex-1">
        <p className="text-sm font-semibold text-dark">{title}</p>
        {desc && <p className="text-xs leading-snug text-dark/55 mt-0.5">{desc}</p>}
      </div>
      <Switch checked={checked} onChange={onChange} disabled={disabled} />
    </div>
  );
}

function SectionTitle({ children }) {
  return (
    <h2 className="flex items-center gap-2 text-base font-bold text-dark mb-3">
      <span className="w-1 h-4 rounded-full bg-primary" />
      {children}
    </h2>
  );
}

function UserRow({ u, children }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-divider bg-white p-3">
      {u.photo_url ? (
        <img
          src={u.photo_url}
          alt={u.username}
          className="w-10 h-10 rounded-full object-cover flex-shrink-0 border-2 border-[#E6A45A]"
        />
      ) : (
        <div className="w-10 h-10 rounded-full flex-shrink-0 border-2 border-[#E6A45A] bg-primary-soft flex items-center justify-center text-white font-bold">
          {u.username?.charAt(0)?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="flex flex-col min-w-0 flex-1">
        <span className="text-sm font-semibold text-dark truncate">{u.username}</span>
        {u.name && <span className="text-xs text-muted truncate">{u.name}</span>}
      </div>
      {children}
    </div>
  );
}

export default function Privacy() {
  const { user, token, login } = useAuth();

  // Estado dos toggles (lê do user; defaults seguros para contas antigas).
  const [isPrivate, setIsPrivate] = useState(user?.is_private === true);
  const [hideLocation, setHideLocation] = useState(user?.hide_location === true);
  const [hideFollowers, setHideFollowers] = useState(user?.hide_followers === true);
  const [searchable, setSearchable] = useState(user?.searchable !== false);
  const [saving, setSaving] = useState(false);

  const [requests, setRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(true);
  const [blocked, setBlocked] = useState([]);
  const [blockedLoading, setBlockedLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    getFollowRequests(token)
      .then((d) => { if (!cancelled) setRequests(Array.isArray(d) ? d : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setRequestsLoading(false); });
    getBlocked(token)
      .then((d) => { if (!cancelled) setBlocked(Array.isArray(d) ? d : []); })
      .catch(() => {})
      .finally(() => { if (!cancelled) setBlockedLoading(false); });
    return () => { cancelled = true; };
  }, [token]);

  // Atualiza um campo de privacidade; reverte o toggle local em caso de erro.
  const persist = async (field, value, setter) => {
    setter(value);
    setSaving(true);
    try {
      const updated = await updateUser(token, { [field]: value });
      login(updated, token);
    } catch {
      setter(!value);
    } finally {
      setSaving(false);
    }
  };

  const accept = async (id) => {
    setRequests((r) => r.filter((u) => u.id !== id));
    try {
      await acceptFollowRequest(token, id);
    } catch {
      // recarrega em caso de falha
      getFollowRequests(token).then((d) => setRequests(Array.isArray(d) ? d : [])).catch(() => {});
    }
  };

  const reject = async (id) => {
    setRequests((r) => r.filter((u) => u.id !== id));
    try {
      await rejectFollowRequest(token, id);
    } catch {
      getFollowRequests(token).then((d) => setRequests(Array.isArray(d) ? d : [])).catch(() => {});
    }
  };

  const unblock = async (id) => {
    setBlocked((b) => b.filter((u) => u.id !== id));
    try {
      await blockUser(token, id);
    } catch {
      getBlocked(token).then((d) => setBlocked(Array.isArray(d) ? d : [])).catch(() => {});
    }
  };

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton />
      </div>

      <div className="px-4 pt-2">
        <h1 className="text-xl font-bold text-dark">Privacidade</h1>
        <p className="text-xs text-dark/60 mt-1">Controla quem vê o teu perfil e a tua atividade.</p>
      </div>

      <div className="flex flex-col gap-7 px-4 mt-6 flex-1">
        <section>
          <SectionTitle>Conta</SectionTitle>
          <div className="flex flex-col gap-3">
            <ToggleRow
              title="Conta privada"
              desc="Só os teus seguidores veem as tuas publicações. Novos seguidores passam a precisar de aprovação."
              checked={isPrivate}
              disabled={saving}
              onChange={(v) => persist("is_private", v, setIsPrivate)}
            />
            <ToggleRow
              title="Esconder localização nas publicações"
              desc="A localização e o traçado das tuas rotas deixam de aparecer para os outros."
              checked={hideLocation}
              disabled={saving}
              onChange={(v) => persist("hide_location", v, setHideLocation)}
            />
            <ToggleRow
              title="Esconder seguidores e quem sigo"
              desc="As listas de seguidores e de quem segues ficam visíveis apenas para ti."
              checked={hideFollowers}
              disabled={saving}
              onChange={(v) => persist("hide_followers", v, setHideFollowers)}
            />
            <ToggleRow
              title="Aparecer na pesquisa"
              desc="Permite que outros utilizadores te encontrem na pesquisa da página Social."
              checked={searchable}
              disabled={saving}
              onChange={(v) => persist("searchable", v, setSearchable)}
            />
          </div>
        </section>

        {isPrivate && (
          <section>
            <SectionTitle>Pedidos de seguidor</SectionTitle>
            {requestsLoading ? (
              <p className="rounded-2xl border border-divider bg-white px-4 py-3 text-xs text-muted">A carregar…</p>
            ) : requests.length === 0 ? (
              <p className="rounded-2xl border border-divider bg-white px-4 py-3 text-xs text-muted">Não tens pedidos pendentes.</p>
            ) : (
              <div className="flex flex-col gap-3">
                {requests.map((u) => (
                  <UserRow key={u.id} u={u}>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => accept(u.id)}
                        className="h-8 px-3 rounded-full bg-primary text-white text-xs font-semibold active:scale-95"
                      >
                        Aceitar
                      </button>
                      <button
                        type="button"
                        onClick={() => reject(u.id)}
                        className="h-8 px-3 rounded-full bg-dark/5 text-dark text-xs font-semibold active:scale-95"
                      >
                        Recusar
                      </button>
                    </div>
                  </UserRow>
                ))}
              </div>
            )}
          </section>
        )}

        <section>
          <SectionTitle>Utilizadores bloqueados</SectionTitle>
          {blockedLoading ? (
            <p className="text-xs text-muted py-2">A carregar…</p>
          ) : blocked.length === 0 ? (
            <p className="rounded-2xl border border-divider bg-white px-4 py-3 text-xs text-muted">Não bloqueaste ninguém.</p>
          ) : (
            <div className="flex flex-col gap-3">
              {blocked.map((u) => (
                <UserRow key={u.id} u={u}>
                  <button
                    type="button"
                    onClick={() => unblock(u.id)}
                    className="h-8 px-3 rounded-full border border-divider text-dark text-xs font-semibold active:scale-95 flex-shrink-0"
                  >
                    Desbloquear
                  </button>
                </UserRow>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="h-8" />
    </>
  );
}
