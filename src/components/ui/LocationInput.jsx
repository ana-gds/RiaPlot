import { useEffect, useRef, useState } from "react";
import { Input } from "./Input.jsx";
import { PinIcon } from "./Icons.jsx";

// Geocoding gratuito do OpenStreetMap (sem chave de API). Limitamos a Portugal
// e fazemos debounce para respeitar a política de uso do serviço.
const NOMINATIM_URL = "https://nominatim.openstreetmap.org/search";

// Encurta o display_name do Nominatim (muito longo) para algo legível, ficando
// com as primeiras partes mais relevantes — ex.: "Costa Nova, Ílhavo, Aveiro".
function shortLabel(displayName) {
  return displayName.split(",").slice(0, 3).map((p) => p.trim()).join(", ");
}

export function LocationInput({ value, onChange, placeholder, className = "" }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const wrapRef = useRef(null);
  const debounceRef = useRef(null);
  const abortRef = useRef(null);

  // Fecha as sugestões ao clicar fora.
  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  // Limpa timers/pedidos pendentes ao desmontar.
  useEffect(() => () => {
    clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

  // Pesquisa com debounce — despoletada pela escrita, não por um efeito.
  const runSearch = (query) => {
    clearTimeout(debounceRef.current);
    if (query.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      abortRef.current?.abort();
      abortRef.current = new AbortController();
      try {
        const params = new URLSearchParams({
          format: "json",
          q: query.trim(),
          limit: "5",
          countrycodes: "pt",
          "accept-language": "pt",
        });
        const res = await fetch(`${NOMINATIM_URL}?${params}`, {
          signal: abortRef.current.signal,
        });
        const data = await res.json();
        setSuggestions(Array.isArray(data) ? data : []);
        setActiveIndex(-1);
        setOpen(true);
      } catch {
        // Pedido cancelado ou falha de rede: ignora, mantém escrita manual.
      }
    }, 300);
  };

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);
    runSearch(text);
  };

  const pick = (item) => {
    clearTimeout(debounceRef.current);
    onChange(shortLabel(item.display_name));
    setOpen(false);
    setSuggestions([]);
    setActiveIndex(-1);
  };

  const onKeyDown = (e) => {
    if (!open || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault();
      pick(suggestions[activeIndex]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div ref={wrapRef} className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10">
        <PinIcon size={16} color="currentColor" />
      </span>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        autoComplete="off"
        className={`pl-10 ${className}`}
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-border-soft bg-white shadow-card">
          {suggestions.map((item, i) => (
            <li key={item.place_id}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(item)}
                className={`flex w-full items-start gap-2 px-3 py-2.5 text-left text-xs text-dark ${
                  i === activeIndex ? "bg-cream" : "hover:bg-cream"
                }`}
              >
                <span className="mt-0.5 flex-shrink-0 text-muted">
                  <PinIcon size={13} color="currentColor" />
                </span>
                <span className="leading-snug">{shortLabel(item.display_name)}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
