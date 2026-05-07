import { DEPTH_LEGEND } from "./mapHelpers.js";

export function DepthLegend({ visible }) {
  if (!visible) return null;
  return (
    <div className="depth-legend">
      {DEPTH_LEGEND.map((item) => (
        <div key={item.label} className="depth-legend__item">
          <span className="depth-legend__dot" style={{ background: item.color }} />
          <span className="depth-legend__label">{item.label}</span>
        </div>
      ))}
    </div>
  );
}
