import { SearchIcon, CloseIcon } from "../ui/Icons.jsx";

export function SearchBar({ value, onChange, onClear, placeholder = "Procura uma rota..." }) {
  return (
    <div className="relative flex-1 group">
      <SearchIcon
        size={18}
        color="currentColor"
        className="absolute left-[14px] top-1/2 -translate-y-1/2 pointer-events-none text-muted group-focus-within:text-primary transition-colors"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-[46px] rounded-[14px] bg-cream pl-[42px] pr-10 text-sm text-dark border border-transparent outline-none shadow-card-soft transition-shadow focus:bg-white focus:border-primary/50 focus:shadow-[0_4px_16px_rgba(219,139,49,0.15)]"
      />
      {value?.length > 0 && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full flex items-center justify-center bg-secondary/10 text-muted"
          aria-label="Limpar pesquisa"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  );
}

export function CompactSearch({ value, onChange, placeholder = "Procura um post" }) {
  return (
    <div className="flex-1 h-12 rounded-[18px] bg-cream shadow-card-soft flex items-center px-4 gap-2.5 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-sm font-light text-dark"
      />
      <SearchIcon size={20} color="var(--color-secondary)" />
    </div>
  );
}
