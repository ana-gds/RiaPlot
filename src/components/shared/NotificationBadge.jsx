// Badge com a contagem de notificações não-lidas. Não renderiza nada quando
// está a zero. Posicionamento é responsabilidade do contentor (usar `relative`).
export function NotificationBadge({ count, className = "" }) {
    if (!count) return null;
    return (
        <span
            className={`min-w-[18px] h-[18px] px-1 rounded-full bg-primary text-white text-[10px] font-bold leading-none flex items-center justify-center ${className}`}
            aria-label={`${count} não lidas`}
        >
            {count > 99 ? "99+" : count}
        </span>
    );
}
