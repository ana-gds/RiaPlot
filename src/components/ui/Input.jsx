import { useState } from "react";
import { EyeIcon } from "./Icons.jsx";

const fieldBase =
  "w-full h-[44px] rounded-lg px-3 text-sm font-medium bg-cream text-dark border border-border-soft outline-none transition-shadow focus:border-border-focus focus:ring-3 focus:ring-ring-focus";

const noSpinnerClass =
  "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";

export function Label({ children, className = "" }) {
  return (
    <label className={`block text-sm font-medium text-dark mb-1.5 ${className}`}>
      {children}
    </label>
  );
}

export function Input({
  type = "text",
  noSpinner = false,
  className = "",
  ...rest
}) {
  return (
    <input
      type={type}
      className={`${fieldBase} ${noSpinner ? noSpinnerClass : ""} ${className}`}
      {...rest}
    />
  );
}

export function PasswordInput({
  value,
  onChange,
  placeholder = "Introduza a sua palavra-passe",
  iconSize = 20,
  letterSpacing,
  className = "",
  ...rest
}) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`pr-11 ${className}`}
        style={letterSpacing ? { letterSpacing: visible ? "normal" : letterSpacing } : undefined}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className={`absolute right-3 top-1/2 -translate-y-1/2 ${visible ? "text-primary" : "text-muted"}`}
        aria-label={visible ? "Ocultar palavra-passe" : "Mostrar palavra-passe"}
      >
        <EyeIcon visible={visible} size={iconSize} color="currentColor" />
      </button>
    </div>
  );
}

export function Textarea({ minHeight = 100, className = "", style, ...rest }) {
  return (
    <textarea
      className={`w-full rounded-lg px-3 py-3 text-sm font-medium leading-relaxed bg-cream text-dark border border-border-soft outline-none transition-shadow resize-y focus:border-border-focus focus:ring-3 focus:ring-ring-focus ${className}`}
      style={{ minHeight, ...style }}
      {...rest}
    />
  );
}

const chevronBg =
  "data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%2386969c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E";

export function Select({ className = "", style, children, ...rest }) {
  return (
    <select
      className={`${fieldBase} appearance-none cursor-pointer pr-9 ${className}`}
      style={{
        backgroundImage: `url("${chevronBg}")`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 12px center",
        ...style,
      }}
      {...rest}
    >
      {children}
    </select>
  );
}
