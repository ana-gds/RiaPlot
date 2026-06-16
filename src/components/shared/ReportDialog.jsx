import { useState } from "react";

/**
 * Diálogo modal para denunciar um post ou utilizador. Recolhe um motivo
 * (obrigatório) e detalhes opcionais, e chama onSubmit(reason, details).
 * O estado de envio/erro é gerido pelo componente-pai através das props
 * `submitting`/`error`.
 */
const REASONS = [
  { key: "spam", label: "Spam ou publicidade" },
  { key: "inappropriate", label: "Conteúdo inapropriado" },
  { key: "harassment", label: "Assédio ou discurso de ódio" },
  { key: "misinformation", label: "Informação falsa" },
  { key: "other", label: "Outro motivo" },
];

export function ReportDialog({ open, targetLabel = "este conteúdo", submitting, error, onSubmit, onCancel }) {
  const [reason, setReason] = useState(null);
  const [details, setDetails] = useState("");

  if (!open) return null;

  const submit = () => {
    if (!reason || submitting) return;
    onSubmit?.(reason, details.trim());
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div onClick={onCancel} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <h3 className="text-base font-bold text-dark mb-1">Denunciar</h3>
        <p className="text-sm text-dark/70 mb-4 leading-relaxed">
          Porque estás a denunciar {targetLabel}? A tua denúncia é anónima.
        </p>

        <div className="flex flex-col gap-1 mb-4">
          {REASONS.map((r) => (
            <label
              key={r.key}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${
                reason === r.key ? "bg-primary/10" : "hover:bg-dark/5"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={r.key}
                checked={reason === r.key}
                onChange={() => setReason(r.key)}
                className="accent-primary"
              />
              <span className="text-sm text-dark">{r.label}</span>
            </label>
          ))}
        </div>

        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value)}
          maxLength={500}
          rows={3}
          placeholder="Detalhes adicionais (opcional)"
          className="w-full resize-none rounded-xl border border-divider px-3 py-2 text-sm text-dark placeholder:text-muted-soft focus:outline-none focus:border-primary mb-2"
        />

        {error && <p className="text-xs text-danger mb-2">{error}</p>}

        <div className="flex gap-3 justify-end mt-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-xl bg-dark/5 text-dark text-sm font-semibold active:scale-95"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!reason || submitting}
            className="h-10 px-4 rounded-xl bg-danger text-white text-sm font-semibold active:scale-95 disabled:opacity-40"
          >
            {submitting ? "A enviar…" : "Denunciar"}
          </button>
        </div>
      </div>
    </div>
  );
}
