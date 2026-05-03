import { useState, useRef } from "react";

const inputClass = "w-full h-[43px] rounded-lg px-3 text-sm font-medium outline-none transition-all";
const inputStyle = { background: "#fff8ef", border: "1.18px solid rgba(219,139,49,0.2)", fontFamily: "Manrope, sans-serif", color: "#0e2c38" };
const focusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(219,139,49,0.1)"; },
    onBlur: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.2)"; e.target.style.boxShadow = "none"; },
};

function EyeIcon({ visible }) {
    if (visible) return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
    return <svg width="20" height="20" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" /></svg>;
}

function PasswordField({ placeholder, value, onChange }) {
    const [visible, setVisible] = useState(false);
    return (
        <div className="relative">
            <input type={visible ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={inputClass} style={{ ...inputStyle, paddingRight: "44px" }} {...focusHandlers} />
            <button type="button" onClick={() => setVisible((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ background: "none", border: "none", cursor: "pointer", color: visible ? "#DB8B31" : "#86969c" }}><EyeIcon visible={visible} /></button>
        </div>
    );
}

function ProgressIndicator({ step }) {
    const steps = [
        { label: "Dados pessoais", key: 1 },
        { label: "Embarcação", key: 2 },
        { label: "Concluir", key: 3 },
    ];

    return (
        <div className="flex items-center justify-center gap-2 px-7 flex-shrink-0">
            {steps.map((s, i) => (
                <div key={s.key} className="contents">
                    {i > 0 && <div className="w-10 h-px" style={{ background: "#dfdddb" }} />}
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ background: step >= s.key ? "#df9746" : "#dfdddb" }} />
                        <span className="text-xs font-medium whitespace-nowrap" style={{ color: step >= s.key ? "#df9746" : step === s.key - 1 ? "#dfdddb" : "#bfbbb7" }}>{s.label}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AvatarUpload({ preview, onFileChange }) {
    const inputRef = useRef(null);
    return (
        <div className="flex flex-col items-center gap-2 mt-8">
            <button
                onClick={() => inputRef.current?.click()}
                className="w-[100px] h-[100px] rounded-full flex items-center justify-center transition-all hover:opacity-80 overflow-hidden"
                style={{
                    border: preview ? "3px solid #DB8B31" : "1.18px dashed #DB8B31",
                    background: preview ? "transparent" : "#f8ecdd",
                }}
            >
                {preview ? (
                    <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="#DB8B31" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="13" r="4" stroke="#DB8B31" strokeWidth="1.5" />
                    </svg>
                )}
            </button>
            <span className="text-[10px]" style={{ color: "#86969c" }}>Adicionar foto</span>
            <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) onFileChange(URL.createObjectURL(f)); }} />
        </div>
    );
}

export default function CriarConta() {
    const [form, setForm] = useState({
        nome: "",
        email: "",
        username: "",
        password: "",
        confirmPassword: "",
    });
    const [avatarPreview, setAvatarPreview] = useState(null);
    const set = (field) => (val) => setForm((p) => ({ ...p, [field]: typeof val === "string" ? val : val.target.value }));

    const handleContinue = () => {
        if (!form.nome.trim() || !form.email.trim() || !form.username.trim()) return;
        if (form.password.length < 8) return;
        if (form.password !== form.confirmPassword) return;
        // TODO: navigate to step 2 (Embarcação)
        console.log("Continuar:", form);
    };

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            {/* Status bar */}
            <div className="h-12 flex-shrink-0" />

            {/* Progress */}
            <ProgressIndicator step={1} />

            {/* Avatar upload */}
            <AvatarUpload preview={avatarPreview} onFileChange={setAvatarPreview} />

            {/* Form */}
            <div className="flex-1 px-5 mt-6 flex flex-col gap-0 overflow-y-auto">
                <div className="mb-3">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>Nome completo</label>
                    <input type="text" placeholder="Ex: João Silva" value={form.nome} onChange={set("nome")} className={inputClass} style={inputStyle} {...focusHandlers} />
                </div>

                <div className="mb-3">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>Email</label>
                    <input type="email" placeholder="exemplo@email.com" value={form.email} onChange={set("email")} className={inputClass} style={inputStyle} {...focusHandlers} />
                </div>

                <div className="mb-3">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>Nome de utilizador</label>
                    <input type="text" placeholder="@utilizador" value={form.username} onChange={set("username")} className={inputClass} style={inputStyle} {...focusHandlers} />
                </div>

                <div className="mb-3">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>Palavra-passe</label>
                    <PasswordField placeholder="Mínimo 8 caracteres" value={form.password} onChange={set("password")} />
                </div>

                <div className="mb-3">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>Confirmar palavra-passe</label>
                    <PasswordField placeholder="Repita a palavra-passe" value={form.confirmPassword} onChange={set("confirmPassword")} />
                </div>
            </div>

            {/* Continue button */}
            <div className="flex justify-center px-5 py-4 pb-8 flex-shrink-0">
                <button
                    onClick={handleContinue}
                    className="h-10 text-white text-base font-semibold rounded-2xl active:scale-95"
                    style={{
                        width: "188px",
                        backgroundColor: "rgba(219,139,49,0.9)",
                        boxShadow: "0 4px 14px rgba(219,139,49,0.35)",
                        border: "none",
                        cursor: "pointer",
                    }}
                >
                    Continuar
                </button>
            </div>
        </div>
    );
}
