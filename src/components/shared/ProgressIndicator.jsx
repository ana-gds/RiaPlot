import { COLORS, FONTS } from "../../constants/theme.js";
import { REGISTRATION_STEPS } from "../../constants/mockData.js";

export function ProgressIndicator({ step, steps = REGISTRATION_STEPS }) {
  return (
    <div className="flex items-center justify-center gap-2 px-7 flex-shrink-0">
      {steps.map((s, i) => {
        const isActive = step >= s.key;
        const lineActive = step > steps[i - 1]?.key;
        return (
          <div key={s.key} className="contents">
            {i > 0 && (
              <div
                className="w-10 h-px"
                style={{ background: lineActive ? "#df9746" : COLORS.divider }}
              />
            )}
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: isActive ? "#df9746" : COLORS.divider }}
              />
              <span
                className="text-xs font-medium whitespace-nowrap"
                style={{
                  color: isActive ? "#df9746" : COLORS.mutedSoft,
                  fontFamily: FONTS.manrope,
                }}
              >
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
