/**
 * Diálogo de confirmação modal (in-app) — substitui o window.confirm do
 * navegador. Renderiza por cima de tudo (z-60) com um overlay clicável.
 */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onCancel,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      <div onClick={onCancel} className="absolute inset-0 bg-black/50" />
      <div className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        {title && <h3 className="text-base font-bold text-dark mb-2">{title}</h3>}
        {message && <p className="text-sm text-dark/70 mb-6 leading-relaxed">{message}</p>}
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="h-10 px-4 rounded-xl bg-dark/5 text-dark text-sm font-semibold active:scale-95"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-10 px-4 rounded-xl bg-danger text-white text-sm font-semibold active:scale-95"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
