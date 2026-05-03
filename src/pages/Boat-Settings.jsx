import { useState, useRef } from "react";

const imgBarco = "https://www.figma.com/api/mcp/asset/2a8ad6f7-8a34-49ee-b9c9-0505caf5dcba";

const inputClass = "w-full h-[43px] rounded-lg px-3 text-sm font-medium outline-none transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const inputStyle = { background: "#fff8ef", border: "1.18px solid rgba(219,139,49,0.2)", fontFamily: "Manrope, sans-serif", color: "#0e2c38" };
const focusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(219,139,49,0.1)"; },
    onBlur: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.2)"; e.target.style.boxShadow = "none"; },
};

function Label({ children }) {
    return <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}>{children}</label>;
}

export default function DefinicoesBarco() {
    const [form, setForm] = useState({ nome: "", tipo: "", calado: "", comprimento: "", boca: "", velocidade: "", folgaSuperior: "", folgaInferior: "" });
    const [preview, setPreview] = useState(null);
    const inputRef = useRef(null);
    const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            <div className="h-12 flex-shrink-0" />
            <button onClick={() => window.history.back()} className="absolute left-4 top-12 w-10 h-10 rounded-full flex items-center justify-center shadow-md z-10" style={{ backgroundColor: "#004D6C" }}><svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" /></svg></button>
            <div className="flex flex-col items-center gap-2 pt-12">
                <button onClick={() => inputRef.current?.click()} className="relative w-[100px] h-[100px] rounded-full overflow-hidden group" style={{ border: "3px solid #DB8B31", boxShadow: "0 4px 16px rgba(219,139,49,0.3)" }}>
                    <img src={preview ?? imgBarco} alt="Barco" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full"><svg width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke="white" strokeWidth="2" /><circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" /></svg></div>
                </button>
                <span className="text-[10px]" style={{ color: "#86969c" }}>Alterar foto</span>
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) setPreview(URL.createObjectURL(f)); }} />
            </div>
            <div className="flex flex-col gap-3.5 px-4 mt-6 flex-1">
                <div><Label>Nome da embarcação</Label><input type="text" placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                <div><Label>Tipo de embarcação</Label><input type="text" placeholder="Ex: Veleiro, Lancha, Caiaque..." value={form.tipo} onChange={set("tipo")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                <div className="flex gap-4">
                    <div className="flex-1"><Label>Calado (m)</Label><input type="number" step="0.1" min="0" placeholder="0.0" value={form.calado} onChange={set("calado")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                    <div className="flex-1"><Label>Comprimento (m)</Label><input type="number" step="0.1" min="0" placeholder="0.0" value={form.comprimento} onChange={set("comprimento")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1"><Label>Boca (m)</Label><input type="number" step="0.1" min="0" placeholder="0.0" value={form.boca} onChange={set("boca")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                    <div className="flex-1"><Label>Velocidade (nós)</Label><input type="number" step="0.1" min="0" placeholder="0.0" value={form.velocidade} onChange={set("velocidade")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1"><Label>Folga superior (m)</Label><input type="number" step="0.1" min="0" placeholder="0.0" value={form.folgaSuperior} onChange={set("folgaSuperior")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                    <div className="flex-1"><Label>Folga inferior (m)</Label><input type="number" step="0.1" min="0" placeholder="0.0" value={form.folgaInferior} onChange={set("folgaInferior")} className={inputClass} style={inputStyle} {...focusHandlers} /></div>
                </div>
            </div>
            <div className="flex justify-center px-4 py-8 mt-4">
                <button onClick={() => console.log("save", form)} className="h-10 text-white text-[15px] font-semibold rounded-2xl active:scale-95" style={{ width: "188px", backgroundColor: "rgba(219,139,49,0.9)", boxShadow: "0 4px 14px rgba(219,139,49,0.35)" }}>Guardar alterações</button>
            </div>
        </div>
    );
}
