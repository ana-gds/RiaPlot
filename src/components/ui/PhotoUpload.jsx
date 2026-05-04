import { useRef } from "react";
import { COLORS } from "../../constants/theme.js";
import { CameraIcon } from "./Icons.jsx";

export function CircleAvatarUpload({ preview, fallbackImage, onFileChange, label = "Adicionar foto" }) {
  const inputRef = useRef(null);
  const showImage = preview ?? fallbackImage;
  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative w-[100px] h-[100px] rounded-full overflow-hidden group flex items-center justify-center transition-all hover:opacity-80"
        style={{
          border: showImage ? `3px solid ${COLORS.primary}` : `1.18px dashed ${COLORS.primary}`,
          background: showImage ? "transparent" : COLORS.sand,
          boxShadow: showImage && fallbackImage ? "0 4px 16px rgba(219,139,49,0.3)" : undefined,
        }}
        aria-label={label}
      >
        {showImage ? (
          <>
            <img src={showImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
              <CameraIcon size={24} color="white" strokeWidth={2} />
            </div>
          </>
        ) : (
          <CameraIcon />
        )}
      </button>
      <span className="text-[10px]" style={{ color: COLORS.muted }}>{label}</span>
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

export function RectanglePhotoUpload({ preview, onFileChange, height = 220 }) {
  const inputRef = useRef(null);
  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all relative overflow-hidden group"
        style={{
          height,
          border: preview ? "none" : `2px dashed rgba(219,139,49,0.35)`,
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
            <span className="text-[13px] font-medium" style={{ color: COLORS.muted }}>Adicionar foto</span>
            <span className="text-[11px]" style={{ color: COLORS.mutedSoft }}>Toca para selecionar uma imagem</span>
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
