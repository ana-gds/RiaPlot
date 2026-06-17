import { REGISTRATION_STEPS } from "../../constants/navigation.js";

export function ProgressIndicator({ step, steps = REGISTRATION_STEPS }) {
  return (
    <div className="flex items-center justify-center gap-2 px-7 flex-shrink-0">
      {steps.map((s, i) => {
        const isActive = step >= s.key;
        const lineActive = step > steps[i - 1]?.key;
        return (
          <div key={s.key} className="contents">
            {i > 0 && (
              <span
                className={`w-10 h-px transition-colors ${lineActive ? "bg-primary" : "bg-divider"}`}
              />
            )}
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full transition-colors ${isActive ? "bg-primary" : "bg-divider"}`}
              />
              <span
                className={`text-xs font-medium whitespace-nowrap transition-colors ${
                  isActive ? "text-primary" : "text-muted-soft"
                }`}
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
