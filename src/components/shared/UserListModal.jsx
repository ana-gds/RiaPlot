/**
 * Modal com uma lista de utilizadores (seguidores / a seguir). Cada item leva
 * ao perfil público do utilizador.
 */
export function UserListModal({ open, title, users, loading, onClose, onSelect }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-sm max-h-[70vh] rounded-2xl bg-white flex flex-col overflow-hidden shadow-xl">
        <div className="flex items-center justify-between px-4 py-3 border-b border-secondary/10">
          <h3 className="text-base font-bold text-dark">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="p-1 text-muted hover:text-dark active:scale-90"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="py-12 text-center text-sm text-muted">A carregar…</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted">Ainda não há ninguém aqui.</div>
          ) : (
            <ul className="px-2 py-2">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    type="button"
                    onClick={() => onSelect?.(u)}
                    className="w-full flex items-center gap-3 px-2 py-2.5 rounded-2xl hover:bg-cream transition-colors text-left"
                  >
                    {u.photo_url ? (
                      <img
                        src={u.photo_url}
                        alt={u.username}
                        className="w-11 h-11 rounded-full object-cover flex-shrink-0 border-2 border-[#E6A45A]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full flex-shrink-0 border-2 border-[#E6A45A] bg-primary-soft flex items-center justify-center text-white font-bold">
                        {u.username?.charAt(0)?.toUpperCase() ?? "?"}
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-dark truncate">{u.username}</span>
                      {u.name && <span className="text-xs text-muted truncate">{u.name}</span>}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
