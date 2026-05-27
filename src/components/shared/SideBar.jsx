import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { logoutUser } from "../../services/api.js";

// ─── Icons ─────────────────────────────────────────────────────

function RotasIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function MapaIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l5.553 2.776A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function SettingsIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 15a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2" /><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" stroke="currentColor" strokeWidth="2" /></svg>;
}
function BoatIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M2 20h20M4 17l2-7h12l2 7M8 10V6a2 2 0 012-2h0a2 2 0 012 2v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function HelpIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" /><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function PrivacyIcon() {
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="2" /><path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
}
function LogoutIcon() {
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function ChevronRight() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ color: "#bfbbb7", marginLeft: "auto" }}><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function EditArrow() {
    return <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

// ─── Menu Item ─────────────────────────────────────────────────

function MenuItem({ icon, label, active = false, hasArrow = true, onClick }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center gap-3.5 w-full px-5 py-2.5 transition-colors"
            style={{
                background: active ? "rgba(219,139,49,0.1)" : "transparent",
                border: "none",
                cursor: "pointer",
                fontFamily: "Manrope, sans-serif",
            }}
        >
            <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center flex-shrink-0 transition-colors"
                style={{
                    background: active ? "rgba(219,139,49,0.15)" : "rgba(0,77,108,0.06)",
                    color: active ? "#DB8B31" : "#004D6C",
                }}
            >
                {icon}
            </div>
            <span
                className="text-sm"
                style={{
                    fontWeight: active ? 600 : 500,
                    color: "#0e2c38",
                }}
            >
        {label}
      </span>
            {hasArrow && <ChevronRight />}
        </button>
    );
}

// ─── Section Label ─────────────────────────────────────────────

function SectionLabel({ children }) {
    return (
        <div className="px-5 pt-2 pb-1">
      <span
          className="text-[10px] font-semibold uppercase"
          style={{ color: "#bfbbb7", letterSpacing: "0.5px" }}
      >
        {children}
      </span>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────

export default function Sidebar({ open, onClose, onNavigate }) {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [activeItem, setActiveItem] = useState("rotas");

    // Lock body scroll when open
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    const handleNav = (key) => {
        setActiveItem(key);
        onNavigate?.(key);
        onClose?.();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                className="fixed inset-0 z-40 transition-opacity duration-300"
                style={{
                    background: "rgba(14,44,56,0.45)",
                    opacity: open ? 1 : 0,
                    pointerEvents: open ? "auto" : "none",
                }}
            />

            {/* Sidebar panel */}
            <div
                className="fixed left-0 top-0 bottom-0 w-[280px] bg-white z-50 flex flex-col transition-transform duration-300"
                style={{
                    transform: open ? "translateX(0)" : "translateX(-100%)",
                    transitionTimingFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
                }}
            >
                {/* Branded header */}
                <div
                    className="flex-shrink-0 pt-14 px-5 pb-5 relative overflow-hidden"
                    style={{ background: "linear-gradient(145deg, #004D6C 0%, #126587 100%)" }}
                >
                    {/* Decorative circles */}
                    <div
                        className="absolute rounded-full"
                        style={{
                            bottom: "-20px",
                            right: "-20px",
                            width: "100px",
                            height: "100px",
                            background: "rgba(219,139,49,0.15)",
                        }}
                    />
                    <div
                        className="absolute rounded-full"
                        style={{
                            top: "-10px",
                            left: "-10px",
                            width: "60px",
                            height: "60px",
                            background: "rgba(255,255,255,0.05)",
                        }}
                    />

                    {/* User info */}
                    <div className="flex items-center gap-3.5 relative z-10">
                        <div
                            className="w-[52px] h-[52px] rounded-full overflow-hidden flex-shrink-0 bg-primary-soft flex items-center justify-center text-white font-bold text-xl"
                            style={{
                                border: "2.5px solid rgba(219,139,49,0.8)",
                                boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            }}
                        >
                            {user?.photo_url ? (
                                <img src={user.photo_url} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                user?.name?.charAt(0)?.toUpperCase() ?? "?"
                            )}
                        </div>
                        <div>
                            <div className="text-base font-bold text-white leading-tight">{user?.name ?? ""}</div>
                            <div className="text-[11px] mt-0.5" style={{ color: "rgba(255,255,255,0.65)" }}>
                                @{user?.username ?? ""}
                            </div>
                            <button
                                onClick={() => handleNav("editarPerfil")}
                                className="flex items-center gap-1 mt-1.5 text-[11px] font-medium"
                                style={{
                                    color: "#DB8B31",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                }}
                            >
                                Editar perfil <EditArrow />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <div className="flex-1 py-4 overflow-y-auto">
                    <SectionLabel>Navegação</SectionLabel>
                    <MenuItem icon={<RotasIcon />} label="Rotas" active={activeItem === "rotas"} onClick={() => handleNav("rotas")} />
                    <MenuItem icon={<MapaIcon />} label="Mapa" active={activeItem === "mapa"} onClick={() => handleNav("mapa")} />

                    <div className="h-px mx-5 my-2" style={{ background: "rgba(0,77,108,0.06)" }} />

                    <SectionLabel>Definições</SectionLabel>
                    <MenuItem icon={<SettingsIcon />} label="Definições da conta" onClick={() => handleNav("defConta")} />
                    <MenuItem icon={<BoatIcon />} label="Definições do barco" onClick={() => handleNav("defBarco")} />

                    <div className="h-px mx-5 my-2" style={{ background: "rgba(0,77,108,0.06)" }} />

                    <SectionLabel>Suporte</SectionLabel>
                    <MenuItem icon={<HelpIcon />} label="Ajuda" hasArrow={false} onClick={() => handleNav("ajuda")} />
                    <MenuItem icon={<PrivacyIcon />} label="Privacidade" hasArrow={false} onClick={() => handleNav("privacidade")} />
                </div>

                {/* Footer */}
                <div
                    className="flex-shrink-0 px-5 py-4 pb-9"
                    style={{ borderTop: "1px solid rgba(0,77,108,0.08)" }}
                >
                    <button
                        onClick={async () => {
                            try { await logoutUser(token); } catch {}
                            logout();
                            onClose?.();
                            navigate("/login");
                        }}
                        className="flex items-center gap-3 w-full py-2.5"
                        style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: "#86969c",
                        }}
                    >
                        <LogoutIcon />
                        <span className="text-sm font-medium">Terminar sessão</span>
                    </button>
                    <div
                        className="text-[10px] text-center mt-2"
                        style={{ color: "#bfbbb7" }}
                    >
                        RIAPLOT v1.0
                    </div>
                </div>
            </div>
        </>
    );
}
