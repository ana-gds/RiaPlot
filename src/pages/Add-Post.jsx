import { useState, useRef } from "react";

const inputClass = "w-full h-[43px] rounded-lg px-3 text-sm font-medium outline-none transition-all";
const inputStyle = { background: "#fff8ef", border: "1.18px solid rgba(219,139,49,0.2)", fontFamily: "Manrope, sans-serif", color: "#0e2c38" };
const focusHandlers = {
    onFocus: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.6)"; e.target.style.boxShadow = "0 0 0 3px rgba(219,139,49,0.1)"; },
    onBlur: (e) => { e.target.style.borderColor = "rgba(219,139,49,0.2)"; e.target.style.boxShadow = "none"; },
};

function CameraIcon({ color = "#DB8B31", size = 40 }) {
    return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5" />
        </svg>
    );
}

function PhotoUpload({ preview, onFileChange }) {
    const inputRef = useRef(null);

    return (
        <div className="mb-5">
            <button
                onClick={() => inputRef.current?.click()}
                className="w-full h-[220px] rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all relative overflow-hidden group"
                style={{
                    border: preview ? "none" : "2px dashed rgba(219,139,49,0.35)",
                    background: preview ? "transparent" : "#faf6f0",
                    cursor: "pointer",
                }}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
                        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl">
                            <CameraIcon color="white" size={28} />
                            <span className="text-xs font-medium text-white">Alterar foto</span>
                        </div>
                    </>
                ) : (
                    <>
                        <CameraIcon />
                        <span className="text-[13px] font-medium" style={{ color: "#86969c" }}>Adicionar foto</span>
                        <span className="text-[11px]" style={{ color: "#bfbbb7" }}>Toca para selecionar uma imagem</span>
                    </>
                )}
            </button>
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

function CharCount({ current, max }) {
    return (
        <div className="text-[11px] text-right mt-1" style={{ color: current > max * 0.9 ? "#f57c00" : "#bfbbb7" }}>
            {current}/{max}
        </div>
    );
}

export default function CriarPost() {
    const [form, setForm] = useState({
        title: "",
        description: "",
        location: "",
        route: "",
    });
    const [photoPreview, setPhotoPreview] = useState(null);

    const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

    const canPublish = form.title.trim() && photoPreview;

    const handlePublish = () => {
        if (!canPublish) return;
        // TODO: call API
        console.log("Publicar:", { ...form, photo: photoPreview });
    };

    return (
        <div className="bg-white relative w-full min-h-screen flex flex-col">
            {/* Status bar */}
            <div className="h-12 flex-shrink-0" />

            {/* Top bar */}
            <div className="flex items-center px-4 flex-shrink-0 h-11">
                <button
                    onClick={() => window.history.back()}
                    className="w-10 h-10 rounded-full flex items-center justify-center shadow-md flex-shrink-0"
                    style={{ backgroundColor: "#004D6C" }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                        <path d="M15 18L9 12L15 6" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </button>
                <span
                    className="flex-1 text-center text-lg font-bold mr-10"
                    style={{ color: "#0e2c38", fontFamily: "Manrope, sans-serif" }}
                >
          Novo Post
        </span>
            </div>

            {/* Form */}
            <div className="flex-1 px-4 pt-5 overflow-y-auto flex flex-col">
                {/* Photo */}
                <PhotoUpload preview={photoPreview} onFileChange={setPhotoPreview} />

                {/* Title */}
                <div className="mb-4">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>
                        Título
                    </label>
                    <input
                        type="text"
                        placeholder="Ex: Manhã de passeio na ria"
                        value={form.title}
                        onChange={set("title")}
                        maxLength={60}
                        className={inputClass}
                        style={inputStyle}
                        {...focusHandlers}
                    />
                    <CharCount current={form.title.length} max={60} />
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>
                        Descrição
                    </label>
                    <textarea
                        placeholder="Conta a tua experiência..."
                        value={form.description}
                        onChange={set("description")}
                        maxLength={300}
                        className="w-full rounded-lg p-3 text-sm font-medium outline-none transition-all resize-y"
                        style={{
                            ...inputStyle,
                            minHeight: "100px",
                            lineHeight: "1.5",
                        }}
                        {...focusHandlers}
                    />
                    <CharCount current={form.description.length} max={300} />
                </div>

                {/* Location */}
                <div className="mb-4">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>
                        Localização
                    </label>
                    <div className="relative">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            className="absolute left-3 top-1/2 -translate-y-1/2"
                            style={{ color: "#86969c" }}
                        >
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        <input
                            type="text"
                            placeholder="Ex: Costa Nova, Aveiro"
                            value={form.location}
                            onChange={set("location")}
                            className={inputClass}
                            style={{ ...inputStyle, paddingLeft: "38px" }}
                            {...focusHandlers}
                        />
                    </div>
                </div>

                {/* Route */}
                <div className="mb-4">
                    <label className="text-sm font-medium mb-1.5 block" style={{ color: "#0e2c38" }}>
                        Associar rota{" "}
                        <span style={{ color: "#bfbbb7", fontWeight: 400 }}>(opcional)</span>
                    </label>
                    <select
                        value={form.route}
                        onChange={set("route")}
                        className={inputClass}
                        style={{
                            ...inputStyle,
                            appearance: "none",
                            WebkitAppearance: "none",
                            cursor: "pointer",
                            backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='12' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M6 9l6 6 6-6' stroke='%2386969c' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center",
                        }}
                        {...focusHandlers}
                    >
                        <option value="">Nenhuma rota</option>
                        <option value="1">Rio Novo do Príncipe</option>
                        <option value="2">Canal Central</option>
                        <option value="3">Costa Nova - Barra</option>
                    </select>
                </div>
            </div>

            {/* Publish button */}
            <div className="px-4 py-4 pb-8 flex-shrink-0">
                <button
                    onClick={handlePublish}
                    disabled={!canPublish}
                    className="w-full h-12 rounded-2xl text-white text-base font-semibold active:scale-[0.98] transition-all"
                    style={{
                        backgroundColor: "rgba(219,139,49,0.9)",
                        boxShadow: canPublish ? "0 4px 14px rgba(219,139,49,0.35)" : "none",
                        border: "none",
                        cursor: canPublish ? "pointer" : "not-allowed",
                        opacity: canPublish ? 1 : 0.5,
                        fontFamily: "Manrope, sans-serif",
                    }}
                >
                    Publicar
                </button>
            </div>
        </div>
    );
}
