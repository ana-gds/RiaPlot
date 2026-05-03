import { useState, useRef } from "react";

const imgAvatar = "https://www.figma.com/api/mcp/asset/1d806cae-39e1-4ad4-823c-3d1e018e7dd8";

const inputClass = "w-full h-[43px] rounded-lg px-3 text-sm font-medium outline-none transition-all";
const inputStyle = { background: "#fff8ef", border: "2px solid rgba(219,139,49,0.2)", fontFamily: "Manrope, sans-serif", color: "#0e2c38" };
const focusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(219,139,49,0.1)"; },
    onBlur: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.2)"; e.target.style.boxShadow = "none"; },
};

function EyeIcon({ visible }) {
    if (visible) return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
    return <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>;
}

function PasswordField({ value, onChange }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder="••••••••••••••••" className={inputClass} style={{ ...inputStyle, letterSpacing: visible ? "normal" : "2px", paddingRight: "40px" }} {...focusHandlers} />
            <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: visible ? "#DB8B31" : "#86969c", background: "none", border: "none", cursor: "pointer" }}><EyeIcon visible={visible} /></button>
        </div>
    );
}

export default function EditarPerfil() {
    const [form, setForm] = useState({ nome: "Ana Guedes", username: "anacarol1na", email: "guedescarolina24@gmail.com", password: "password123" });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const inputRef = useRef(null);
    const set = (field) => (val) => setForm((p) => ({ ...p, [field]: typeof val === "string" ? val : val.target.value }));

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            <div className="h-12 flex-shrink-0" />
            <button onClick={() => window.history.back()} className="absolute left-4 top-12 w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10" style={{ backgroundColor: "#004D6C" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <div className="flex flex-col items-center gap-2 pt-12">
                <button onClick={() => inputRef.current?.click()} className="relative w-[100px] h-[100px] rounded-full overflow-hidden group" style={{ border: "3px solid #DB8B31", boxShadow: "0 4px 16px rgba(219,139,49,0.3)" }}>
                    <img src={avatarPreview ?? imgAvatar} alt="Avatar" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" /><circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" /></svg></div>
                </button>
                <span className="text-[10px]" style={{ color: "#86969c" }}>Alterar foto</span>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setAvatarPreview(URL.createObjectURL(f)); }} />
            </div>
            <div className="flex flex-col gap-4 px-4 mt-6 flex-1">
                <div><label className="text-sm font-medium mb-2 block" style={{ color: "#0e2c38" }}>Nome</label><input type="text" value={form.nome} onChange={set("nome")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                <div><label className="text-sm font-medium mb-2 block" style={{ color: "#0e2c38" }}>Nome de utilizador</label><input type="text" value={form.username} onChange={set("username")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                <div><label className="text-sm font-medium mb-2 block" style={{ color: "#0e2c38" }}>Email</label><input type="email" value={form.email} onChange={set("email")} className={inputClass} style={{ ...inputStyle, textDecoration: "underline" }} {...focusHandlers} /></div>
                <div><label className="text-sm font-medium mb-2 block" style={{ color: "#0e2c38" }}>Palavra-passe</label><PasswordField value={form.password} onChange={set("password")} /></div>
            </div>
            <div className="flex flex-col items-center gap-4 px-4 py-8 mt-8">
                <button onClick={() => console.log("save", form)} className="h-10 text-white text-[15px] font-semibold rounded-2xl active:scale-95" style={{ width: "188px", backgroundColor: "rgba(219,139,49,0.9)", boxShadow: "0 4px 14px rgba(219,139,49,0.35)" }}>Guardar alterações</button>
                <button onClick={() => window.confirm("Eliminar conta?") && console.log("deleted")} className="text-xs font-medium hover:text-red-600" style={{ color: "rgba(14,44,56,0.6)", background: "none", border: "none", cursor: "pointer" }}>Eliminar conta</button>
            </div>
        </div>
    );
}
