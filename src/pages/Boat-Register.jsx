import { useState, useRef } from "react";

const inputClass =
    "w-full h-[43px] rounded-lg px-3 text-sm font-medium outline-none transition-all " +
    "[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const inputStyle = {
    background: "#fff8ef",
    border: "1.18px solid rgba(219,139,49,0.2)",
    fontFamily: "Manrope, sans-serif",
    color: "#0e2c38",
};
const focusHandlers = {
    onFocus: (e) => {
        e.target.style.borderColor = "rgba(219,139,49,0.6)";
        e.target.style.boxShadow = "0 0 0 3px rgba(219,139,49,0.1)";
    },
    onBlur: (e) => {
        e.target.style.borderColor = "rgba(219,139,49,0.2)";
        e.target.style.boxShadow = "none";
    },
};

function Label({ children }) {
    return (
        <label
            className="text-sm font-medium mb-1.5 block"
            style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
        >
            {children}
        </label>
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
            {steps.map((s, i) => {
                const isActive = step >= s.key;
                const lineActive = step > steps[i]?.key;
                return (
                    <div key={s.key} className="contents">
                        {i > 0 && (
                            <div
                                className="w-10 h-px"
                                style={{ background: lineActive ? "#df9746" : "#dfdddb" }}
                            />
                        )}
                        <div className="flex items-center gap-2">
                            <div
                                className="w-2 h-2 rounded-full"
                                style={{ background: isActive ? "#df9746" : "#dfdddb" }}
                            />
                            <span
                                className="text-xs font-medium whitespace-nowrap"
                                style={{
                                    color: isActive ? "#df9746" : "#bfbbb7",
                                    fontFamily: "Manrope, sans-serif",
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

function BoatPhotoUpload({ preview, onFileChange }) {
    const inputRef = useRef(null);
    return (
        <div className="flex flex-col items-center gap-2 mt-8 flex-shrink-0">
            <button
                onClick={() => inputRef.current?.click()}
                className="w-[100px] h-[100px] rounded-full flex items-center justify-center transition-all hover:opacity-80 overflow-hidden"
                style={{
                    border: preview ? "3px solid #DB8B31" : "1.18px dashed #DB8B31",
                    background: preview ? "transparent" : "#f8ecdd",
                }}
                aria-label="Adicionar foto da embarcação"
            >
                {preview ? (
                    <img
                        src={preview}
                        alt="Embarcação"
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                            stroke="#DB8B31"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        <circle cx="12" cy="13" r="4" stroke="#DB8B31" strokeWidth="1.5" />
                    </svg>
                )}
            </button>
            <span className="text-[10px]" style={{ color: "#86969c" }}>
        Adicionar foto
      </span>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onFileChange(URL.createObjectURL(f));
                }}
            />
        </div>
    );
}

export default function RegistarEmbarcacao() {
    const [form, setForm] = useState({
        nome: "",
        tipo: "",
        calado: "",
        comprimento: "",
        boca: "",
        velocidade: "",
        folgaSuperior: "",
        folgaInferior: "",
    });
    const [boatPreview, setBoatPreview] = useState(null);
    const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

    const handleContinue = () => {
        // TODO: validate & navigate to step 3 (Concluir)
        console.log("Registar embarcação:", form);
    };

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            {/* Status bar */}
            <div className="h-12 flex-shrink-0" />

            {/* Progress: step 2 */}
            <ProgressIndicator step={2} />

            {/* Boat photo */}
            <BoatPhotoUpload preview={boatPreview} onFileChange={setBoatPreview} />

            {/* Form */}
            <div className="flex-1 px-4 mt-5 flex flex-col gap-0 overflow-y-auto">
                <div className="mb-3">
                    <Label>Nome da embarcação</Label>
                    <input
                        type="text"
                        placeholder="Ex: Gaivota"
                        value={form.nome}
                        onChange={set("nome")}
                        className={inputClass}
                        style={inputStyle}
                        {...focusHandlers}
                    />
                </div>

                <div className="mb-3">
                    <Label>Tipo de embarcação</Label>
                    <input
                        type="text"
                        placeholder="Ex: Veleiro, Lancha, Caiaque..."
                        value={form.tipo}
                        onChange={set("tipo")}
                        className={inputClass}
                        style={inputStyle}
                        {...focusHandlers}
                    />
                </div>

                <div className="flex gap-4 mb-3">
                    <div className="flex-1">
                        <Label>Calado (m)</Label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.calado}
                            onChange={set("calado")}
                            className={inputClass}
                            style={inputStyle}
                            {...focusHandlers}
                        />
                    </div>
                    <div className="flex-1">
                        <Label>Comprimento (m)</Label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.comprimento}
                            onChange={set("comprimento")}
                            className={inputClass}
                            style={inputStyle}
                            {...focusHandlers}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mb-3">
                    <div className="flex-1">
                        <Label>Boca (m)</Label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.boca}
                            onChange={set("boca")}
                            className={inputClass}
                            style={inputStyle}
                            {...focusHandlers}
                        />
                    </div>
                    <div className="flex-1">
                        <Label>Velocidade (nós)</Label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.velocidade}
                            onChange={set("velocidade")}
                            className={inputClass}
                            style={inputStyle}
                            {...focusHandlers}
                        />
                    </div>
                </div>

                <div className="flex gap-4 mb-3">
                    <div className="flex-1">
                        <Label>Folga superior (m)</Label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.folgaSuperior}
                            onChange={set("folgaSuperior")}
                            className={inputClass}
                            style={inputStyle}
                            {...focusHandlers}
                        />
                    </div>
                    <div className="flex-1">
                        <Label>Folga inferior (m)</Label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            placeholder="0.0"
                            value={form.folgaInferior}
                            onChange={set("folgaInferior")}
                            className={inputClass}
                            style={inputStyle}
                            {...focusHandlers}
                        />
                    </div>
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
