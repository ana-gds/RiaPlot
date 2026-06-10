export function ChevronLeftIcon({ size = 18, color = "white", strokeWidth = 2.5, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M15 18L9 12L15 6" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 12, color = "#86969c", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M6 9l6 6 6-6" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function MenuIcon({ size = 22, color = "white", strokeWidth = 2.2, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M3 12h18M3 6h18M3 18h18" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function SearchIcon({ size = 18, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ color }} aria-hidden="true">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
      <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function CloseIcon({ size = 14, color = "currentColor", strokeWidth = 2.5, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function FilterIcon({ size = 18, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function HeartIcon({ filled = false, size = 22, fillColor = "#DB8B31", strokeColor = "#0e2c38", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? fillColor : "none"} className={className} aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={filled ? fillColor : strokeColor} strokeWidth="2" />
    </svg>
  );
}

export function BookmarkIcon({ filled = false, size = 20, color = "#004D6C", strokeColor = "#0e2c38", className = "" }) {
  return (
    <svg width={size} height={Math.round((size * 24) / 20)} viewBox="0 0 24 24" fill={filled ? color : "none"} className={className} aria-hidden="true">
      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={filled ? color : strokeColor} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function CommentIcon({ size = 22, color = "#0e2c38", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ClockIcon({ size = 12, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} style={{ color }} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
      <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PinIcon({ size = 16, color = "#86969c", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" stroke={color} strokeWidth="2" />
      <circle cx="12" cy="10" r="3" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function CameraIcon({ size = 40, color = "#DB8B31", strokeWidth = 1.5, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="13" r="4" stroke={color} strokeWidth={strokeWidth} />
    </svg>
  );
}

export function EyeIcon({ visible = false, size = 20, color = "currentColor", className = "" }) {
  if (visible) {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <line x1="1" y1="1" x2="23" y2="23" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="2" />
    </svg>
  );
}

export function GoogleLogo({ size = 20, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
    </svg>
  );
}

export function WarningIcon({ size = 20, color = "#f57c00", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={`flex-shrink-0 mt-0.5 ${className}`} aria-hidden="true">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke={color} strokeWidth="2" />
      <line x1="12" y1="9" x2="12" y2="13" stroke={color} strokeWidth="2" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" stroke={color} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export function PlusIcon({ size = 26, color = "white", strokeWidth = 2.5, className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <line x1="5" y1="12" x2="19" y2="12" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
    </svg>
  );
}

export function SendIcon({ size = 24, color = "#DB8B31", className = "" }) {
  return (
    <svg width={size} height={size - 3} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M22 2L11 13" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function PlayIcon({ size = 30, color = "white", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color} className={className} aria-hidden="true">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

export function MapIcon({ size = 16, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M9 3L3 5v16l6-2 6 2 6-2V3l-6 2-6-2z" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 3v16M15 5v16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function SatelliteIcon({ size = 16, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 19l-2-2 4-4 2 2-4 4zM13 11l4-4M9 7l8 8M11 5l8 8" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 4l6 6-3 3-6-6 3-3z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function WavesIcon({ size = 18, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M2 8c2 0 2-1.5 4-1.5S8 8 10 8s2-1.5 4-1.5S16 8 18 8s2-1.5 4-1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 14c2 0 2-1.5 4-1.5S8 14 10 14s2-1.5 4-1.5S16 14 18 14s2-1.5 4-1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M2 20c2 0 2-1.5 4-1.5S8 20 10 20s2-1.5 4-1.5S16 20 18 20s2-1.5 4-1.5" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function RoutesNavIcon({ size = 24, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 36 35" fill="none" className={className} aria-hidden="true">
      <path
        d="M14.425 9.09026C14.425 11.9948 9.65 16.3819 9.65 16.3819C9.65 16.3819 4.875 11.9948 4.875 9.09026C4.89438 8.49967 5.0333 7.91858 5.28382 7.38022C5.53434 6.84186 5.89154 6.35679 6.33501 5.95273C6.77847 5.54867 7.2995 5.23355 7.86831 5.02539C8.43712 4.81722 9.04256 4.7201 9.65 4.73956C10.2574 4.7201 10.8629 4.81722 11.4317 5.02539C12.0005 5.23355 12.5215 5.54867 12.965 5.95273C13.4085 6.35679 13.7657 6.84186 14.0162 7.38022C14.2667 7.91858 14.4056 8.49967 14.425 9.09026Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M8.46252 9.38193C8.46252 9.68813 8.58764 9.98178 8.81034 10.1983C9.03303 10.4148 9.33508 10.5364 9.65002 10.5364C9.96497 10.5364 10.267 10.4148 10.4897 10.1983C10.7124 9.98178 10.8375 9.68813 10.8375 9.38193C10.8375 9.07573 10.7124 8.78208 10.4897 8.56557C10.267 8.34905 9.96497 8.22742 9.65002 8.22742C9.33508 8.22742 9.03303 8.34905 8.81034 8.56557C8.58764 8.78208 8.46252 9.07573 8.46252 9.38193Z"
        fill={color}
      />
      <path
        d="M31.125 20.684C31.125 23.5885 26.35 27.9757 26.35 27.9757C26.35 27.9757 21.575 23.625 21.575 20.684C21.6173 19.4934 22.144 18.3678 23.0393 17.5543C23.9345 16.7409 25.1252 16.3061 26.35 16.3455C27.5747 16.3061 28.7654 16.7409 29.6606 17.5543C30.5559 18.3678 31.0826 19.4934 31.125 20.684Z"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
      />
      <path
        d="M25.1625 20.9757C25.1625 21.2819 25.2876 21.5755 25.5103 21.792C25.733 22.0086 26.035 22.1302 26.35 22.1302C26.6649 22.1302 26.967 22.0086 27.1897 21.792C27.4124 21.5755 27.5375 21.2819 27.5375 20.9757C27.5375 20.6695 27.4124 20.3758 27.1897 20.1593C26.967 19.9428 26.6649 19.8212 26.35 19.8212C26.035 19.8212 25.733 19.9428 25.5103 20.1593C25.2876 20.3758 25.1625 20.6695 25.1625 20.9757Z"
        fill={color}
      />
      <path
        d="M8.45 18.7153H13.825C14.6173 18.7153 15.3772 19.0213 15.9375 19.566C16.4977 20.1107 16.8125 20.8495 16.8125 21.6198C16.8125 22.3901 16.4977 23.1289 15.9375 23.6736C15.3772 24.2183 14.6173 24.5243 13.825 24.5243H7.8625C7.08299 24.5241 6.33426 24.82 5.7761 25.3491C5.21794 25.8781 4.89457 26.5983 4.875 27.3559C4.875 28.1262 5.18975 28.865 5.75002 29.4097C6.31028 29.9544 7.07017 30.2604 7.8625 30.2604H27.55"
        stroke={color}
        strokeWidth="2"
        strokeMiterlimit="10"
      />
    </svg>
  );
}

export function AnchorIcon({ size = 16, color = "currentColor", className = "" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="5" r="2" stroke={color} strokeWidth="2" />
      <path d="M12 7v15M5 12h14M5 17a7 7 0 007 4 7 7 0 007-4" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
