import { useMemo, useState } from "react";

function routeKey(r) {
  return r.id ?? r._id?.$oid ?? r._id;
}

/**
 * Folha inferior para planear uma rota: escolhe-se o cais de partida e
 * aparecem todas as rotas que partem dali. Escolher uma define-a como rota
 * ativa no mapa (pronta a visualizar/simular).
 */
export function RoutePicker({ open, onClose, routes, onSelectRoute }) {
  const [dock, setDock] = useState("");

  // Cais de partida distintos, a partir das rotas disponíveis.
  const departures = useMemo(() => {
    const set = new Set();
    routes.forEach((r) => {
      const n = r.cais_partida?.nome;
      if (n) set.add(n);
    });
    return [...set].sort((a, b) => a.localeCompare(b, "pt"));
  }, [routes]);

  const filtered = useMemo(
    () => (dock ? routes.filter((r) => r.cais_partida?.nome === dock) : []),
    [routes, dock],
  );

  if (!open) return null;

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 z-40 bg-black/40" />
      <div className="fixed inset-x-0 bottom-0 z-50 mx-auto w-full max-w-[480px]">
        <div className="rounded-t-2xl bg-white flex flex-col overflow-hidden max-h-[70vh] shadow-top-sheet">
          <div className="flex justify-center pt-3 pb-1">
            <span className="w-[72px] h-1 rounded-full bg-secondary/20" />
          </div>
          <div className="flex items-center justify-between px-4 pb-3">
            <div>
              <h2 className="text-base font-bold text-dark">Planear rota</h2>
              <p className="text-xs text-muted">Escolhe o cais de partida</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Fechar"
              className="p-1 text-muted hover:text-dark active:scale-90"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-4 pb-2">
            <label className="text-xs font-semibold text-muted">Cais de partida</label>
            <select
              value={dock}
              onChange={(e) => setDock(e.target.value)}
              className="mt-1 w-full h-11 rounded-xl border border-secondary/15 bg-cream px-3 text-sm text-dark outline-none"
            >
              <option value="">Seleciona um cais…</option>
              {departures.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-2">
            {!dock ? (
              <p className="py-8 text-center text-sm text-muted">
                Escolhe um cais para veres as rotas que partem dali.
              </p>
            ) : filtered.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">
                Não há rotas com partida deste cais.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {filtered.map((r) => (
                  <li key={routeKey(r)}>
                    <button
                      type="button"
                      onClick={() => onSelectRoute(r)}
                      className="w-full text-left rounded-xl border border-secondary/10 px-3 py-2.5 hover:bg-cream active:scale-[0.99] transition"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-semibold text-dark truncate">
                          {r.nome ?? "Rota"}
                        </span>
                        {r.distancia_nm && (
                          <span className="text-xs text-muted flex-shrink-0">{r.distancia_nm} nm</span>
                        )}
                      </div>
                      {r.cais_chegada?.nome && (
                        <span className="text-xs text-muted">→ {r.cais_chegada.nome}</span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
