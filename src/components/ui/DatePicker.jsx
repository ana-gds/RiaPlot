import { useState, useRef, useEffect } from "react";

// Calendário próprio, consistente com o resto da app (substitui o calendário
// nativo do browser, que é inconsistente entre sistemas). Trabalha com datas no
// formato "YYYY-MM-DD" para casar com o backend.

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const MONTHS_SHORT = [
  "jan", "fev", "mar", "abr", "mai", "jun",
  "jul", "ago", "set", "out", "nov", "dez",
];
// Semana a começar à segunda-feira (norma em Portugal).
const WEEKDAYS = ["seg", "ter", "qua", "qui", "sex", "sáb", "dom"];

const pad = (n) => String(n).padStart(2, "0");
const fmt = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

function parse(value) {
  const [y, m, d] = (value || "").split("-").map(Number);
  if (!y || !m || !d) {
    const t = new Date();
    return { y: t.getFullYear(), m: t.getMonth() + 1, d: t.getDate() };
  }
  return { y, m, d };
}

export function DatePicker({ value, onChange, min, max }) {
  const sel = parse(value);
  const [open, setOpen] = useState(false);
  const [view, setView] = useState({ y: sel.y, m: sel.m });
  const wrapRef = useRef(null);

  // Ao abrir, mostra o mês da data selecionada. Feito no handler (não num efeito)
  // para evitar renders em cascata.
  const toggle = () => {
    if (open) {
      setOpen(false);
    } else {
      setView({ y: sel.y, m: sel.m });
      setOpen(true);
    }
  };

  // Fecha ao clicar fora.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const today = new Date();
  const isToday = (d) =>
    view.y === today.getFullYear() && view.m === today.getMonth() + 1 && d === today.getDate();
  const isSel = (d) => view.y === sel.y && view.m === sel.m && d === sel.d;

  const daysInMonth = new Date(view.y, view.m, 0).getDate();
  // Dia da semana do dia 1, com a semana a começar à segunda (0=seg … 6=dom).
  const firstDow = (new Date(view.y, view.m - 1, 1).getDay() + 6) % 7;
  const cells = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  // Limites opcionais (YYYY-MM-DD). Como as datas estão zero-padded, a
  // comparação de strings equivale à comparação cronológica.
  const monthStart = fmt(view.y, view.m, 1);
  const monthEnd = fmt(view.y, view.m, daysInMonth);
  const canPrev = !min || min < monthStart;
  const canNext = !max || max > monthEnd;
  const outOfRange = (d) => {
    const ds = fmt(view.y, view.m, d);
    return (min && ds < min) || (max && ds > max);
  };

  const prevMonth = () => {
    if (!canPrev) return;
    setView((v) => (v.m === 1 ? { y: v.y - 1, m: 12 } : { y: v.y, m: v.m - 1 }));
  };
  const nextMonth = () => {
    if (!canNext) return;
    setView((v) => (v.m === 12 ? { y: v.y + 1, m: 1 } : { y: v.y, m: v.m + 1 }));
  };
  const pick = (d) => {
    if (outOfRange(d)) return;
    onChange(fmt(view.y, view.m, d));
    setOpen(false);
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        className="flex h-[42px] w-full items-center justify-between rounded-[10px] border border-primary/20 bg-cream px-3 text-[13px] font-medium text-dark transition-colors hover:border-primary/40"
      >
        <span>
          {sel.d} {MONTHS_SHORT[sel.m - 1]} {sel.y}
        </span>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-primary">
          <rect x="3" y="4.5" width="18" height="17" rx="3" stroke="currentColor" strokeWidth="2" />
          <path d="M3 9h18M8 2.5v4M16 2.5v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50 rounded-2xl bg-white p-3 shadow-[0_8px_32px_rgba(0,77,108,0.2)]">
          <div className="mb-2 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              disabled={!canPrev}
              aria-label="Mês anterior"
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors ${
                canPrev ? "hover:bg-cream" : "opacity-30 cursor-not-allowed"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <span className="text-sm font-bold text-dark">
              {MONTHS[view.m - 1]} {view.y}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              disabled={!canNext}
              aria-label="Mês seguinte"
              className={`flex h-8 w-8 items-center justify-center rounded-lg text-secondary transition-colors ${
                canNext ? "hover:bg-cream" : "opacity-30 cursor-not-allowed"
              }`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="mb-1 grid grid-cols-7">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-center text-[10px] font-semibold uppercase text-muted-soft">
                {w}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-0.5">
            {cells.map((d, i) =>
              d === null ? (
                <span key={`b${i}`} />
              ) : outOfRange(d) ? (
                <span
                  key={d}
                  aria-disabled="true"
                  className="mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[13px] text-muted-soft/40 cursor-not-allowed"
                >
                  {d}
                </span>
              ) : (
                <button
                  key={d}
                  type="button"
                  onClick={() => pick(d)}
                  className={`mx-auto flex h-9 w-9 items-center justify-center rounded-lg text-[13px] transition-colors ${
                    isSel(d)
                      ? "bg-primary font-bold text-white shadow-primary-button"
                      : isToday(d)
                        ? "font-bold text-primary ring-1 ring-primary/40"
                        : "text-dark hover:bg-cream"
                  }`}
                >
                  {d}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
}
