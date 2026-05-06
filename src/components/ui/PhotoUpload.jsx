import { useRef } from "react";
import { CameraIcon } from "./Icons.jsx";

export function CircleAvatarUpload({ preview, fallbackImage, onFileChange, label = "Adicionar foto" }) {
  const inputRef = useRef(null);
  const showImage = preview ?? fallbackImage;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          "relative w-[100px] h-[100px] rounded-full overflow-hidden group flex items-center justify-center transition-all hover:opacity-90",
          showImage
            ? "border-[3px] border-primary shadow-[0_4px_16px_rgba(219,139,49,0.3)]"
            : "border border-dashed border-primary bg-sand",
        ].join(" ")}
        aria-label={label}
      >
        {showImage ? (
          <>
            <img src={showImage} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <CameraIcon size={24} color="white" strokeWidth={2} />
            </div>
          </>
        ) : (
          <CameraIcon />
        )}
      </button>
      <span className="text-[10px] text-muted">{label}</span>
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
        className={[
          "w-full rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all relative overflow-hidden group",
          preview
            ? ""
            : "border-2 border-dashed border-primary/35 bg-cream",
        ].join(" ")}
        style={{ height }}
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
            <span className="text-[13px] font-medium text-muted">Adicionar foto</span>
            <span className="text-[11px] text-muted-soft">Toca para selecionar uma imagem</span>
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
