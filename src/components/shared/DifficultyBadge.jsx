import { DIFFICULTY } from "../../constants/theme.js";

export function DifficultyBadge({ level }) {
  const color = DIFFICULTY.colors[level];
  return (
    <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-white/95 shadow-[0_2px_8px_rgba(0,0,0,0.15)]">
      {[1, 2, 3].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i <= level ? color : "var(--color-divider)" }}
        />
      ))}
      <span className="text-[11px] font-semibold ml-1 text-dark">
        {DIFFICULTY.labels[level]}
      </span>
    </div>
  );
}

export function DifficultyBar({ level = 1, maxLevel = 4 }) {
  const color = DIFFICULTY.colors[level];
  return (
    <div>
      <div className="flex gap-2 mb-1.5">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <span
            key={i}
            className="flex-1 h-2 rounded-full"
            style={{ background: i < level ? color : "var(--color-divider)" }}
          />
        ))}
      </div>
      <span className="text-xs text-muted">{DIFFICULTY.labels[level]}</span>
    </div>
  );
}
