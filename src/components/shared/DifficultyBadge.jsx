import { COLORS, DIFFICULTY } from "../../constants/theme.js";

export function DifficultyBadge({ level }) {
  const color = DIFFICULTY.colors[level];
  return (
    <div
      className="absolute top-4 left-4 flex items-center gap-1 px-2.5 py-1.5 rounded-full"
      style={{
        background: "rgba(255,255,255,0.95)",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
      }}
    >
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="w-1.5 h-1.5 rounded-full"
          style={{ background: i <= level ? color : COLORS.divider }}
        />
      ))}
      <span className="text-[11px] font-semibold ml-1" style={{ color: COLORS.dark }}>
        {DIFFICULTY.labels[level]}
      </span>
    </div>
  );
}

export function DifficultyBar({ level = 1, maxLevel = 4 }) {
  return (
    <div>
      <div className="flex gap-2 mb-1">
        {Array.from({ length: maxLevel }).map((_, i) => (
          <div
            key={i}
            className="w-[60px] h-1.5 rounded-full"
            style={{ background: i < level ? DIFFICULTY.colors[level] : COLORS.divider }}
          />
        ))}
      </div>
      <span className="text-xs" style={{ color: COLORS.muted }}>
        {DIFFICULTY.labels[level]}
      </span>
    </div>
  );
}
