import { SearchIcon, CloseIcon } from "../ui/Icons.jsx";

export function SearchBar({
  value,
  onChange,
  onClear,
  placeholder = "Procura uma rota...",
  onFocus,
  onBlur,
  onKeyDown,
}) {
  return (
    <div className="relative flex-1 group">
      <SearchIcon
        size={18}
        color="currentColor"
        className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-primary transition-colors"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        className="w-full h-12 rounded-full bg-cream pl-11 pr-11 text-sm font-medium text-dark placeholder:text-muted/70 border border-primary/20 outline-none shadow-[0_2px_10px_rgba(0,77,108,0.05)] transition-all hover:border-primary/40 focus:bg-white focus:border-primary focus:shadow-[0_6px_22px_rgba(219,139,49,0.22)]"
      />
      {value?.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-secondary/10 text-muted hover:bg-secondary/15 hover:text-dark active:scale-90 transition-colors"
          aria-label="Limpar pesquisa"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}
