import { useRef, useState } from "react";
import { CameraIcon, CloseIcon, PlusIcon, RoutesNavIcon } from "./Icons.jsx";

export function CircleAvatarUpload({ preview, fallbackImage, onFileChange, label = "Adicionar foto" }) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const showImage = localPreview ?? preview ?? fallbackImage;

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
          if (f) {
            setLocalPreview(URL.createObjectURL(f));
            onFileChange?.(f);
          }
        }}
      />
    </div>
  );
}

export function RectanglePhotoUpload({ preview, onFileChange, height = 220 }) {
  const inputRef = useRef(null);
  const [localPreview, setLocalPreview] = useState(null);
  const showPreview = localPreview ?? preview;

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={[
          "w-full rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-all relative overflow-hidden group",
          showPreview
            ? ""
            : "border-2 border-dashed border-primary/35 bg-cream",
        ].join(" ")}
        style={{ height }}
      >
        {showPreview ? (
          <>
            <img src={showPreview} alt="Preview" className="absolute inset-0 w-full h-full object-cover rounded-2xl" />
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
          if (f) {
            setLocalPreview(URL.createObjectURL(f));
            onFileChange?.(f);
          }
        }}
      />
    </div>
  );
}

let photoUid = 0;

/**
 * Multi-image picker. Calls `onFilesChange` with the current array of new File
 * objects, and `onChange` with the full ordered list of items — each either an
 * already-uploaded image (`{ url }`) or a newly picked one (`{ file }`). Use
 * `initialImages` (array of URLs) to pre-fill existing photos when editing.
 */
export function MultiPhotoUpload({ onFilesChange, onChange, initialImages = [], max = 8 }) {
  const inputRef = useRef(null);
  const [items, setItems] = useState(() =>
    initialImages.map((url) => ({ id: ++photoUid, file: null, preview: url, url })),
  ); // { id, file, preview, url }

  const emit = (next) => {
    setItems(next);
    onFilesChange?.(next.filter((i) => i.file).map((i) => i.file));
    onChange?.(next);
  };

  const addFiles = (fileList) => {
    const incoming = Array.from(fileList ?? []);
    if (incoming.length === 0) return;
    const room = max - items.length;
    const next = [
      ...items,
      ...incoming.slice(0, room).map((file) => ({
        id: ++photoUid,
        file,
        preview: URL.createObjectURL(file),
        url: null,
      })),
    ];
    emit(next);
  };

  const removeAt = (id) => {
    const target = items.find((i) => i.id === id);
    if (target?.file) URL.revokeObjectURL(target.preview);
    emit(items.filter((i) => i.id !== id));
  };

  const canAddMore = items.length < max;

  return (
    <div>
      {items.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full rounded-2xl flex flex-col items-center justify-center gap-2.5 border-2 border-dashed border-primary/35 bg-cream"
          style={{ height: 220 }}
        >
          <CameraIcon />
          <span className="text-[13px] font-medium text-muted">Adicionar fotos</span>
          <span className="text-[11px] text-muted-soft">Podes selecionar várias imagens</span>
        </button>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {items.map((item) => (
            <div key={item.id} className="relative aspect-square rounded-xl overflow-hidden">
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeAt(item.id)}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/55 flex items-center justify-center active:scale-90"
                aria-label="Remover foto"
              >
                <CloseIcon size={12} color="white" />
              </button>
            </div>
          ))}
          {canAddMore && (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="aspect-square rounded-xl flex flex-col items-center justify-center gap-1 border-2 border-dashed border-primary/35 bg-cream active:scale-95"
              aria-label="Adicionar mais fotos"
            >
              <PlusIcon size={20} color="var(--color-primary)" />
              <span className="text-[10px] text-muted">Adicionar</span>
            </button>
          )}
        </div>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          addFiles(e.target.files);
          e.target.value = ""; // permite re-selecionar o mesmo ficheiro
        }}
      />
    </div>
  );
}

/**
 * GPX file picker for the route taken. Calls `onFileChange` with the File when
 * a new file is picked, or `null` when cleared. `initialName` pre-fills the name
 * of an existing GPX file (when editing) without holding a File object.
 */
export function GpxUpload({ onFileChange, initialName = null }) {
  const inputRef = useRef(null);
  const [fileName, setFileName] = useState(initialName);

  const clear = () => {
    setFileName(null);
    onFileChange?.(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="w-full rounded-2xl flex items-center gap-3 px-4 py-3 border-2 border-dashed border-primary/35 bg-cream text-left active:scale-[0.99]"
      >
        <span className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
          <RoutesNavIcon size={18} color="var(--color-primary)" />
        </span>
        <span className="flex-1 min-w-0">
          {fileName ? (
            <span className="block text-[13px] font-medium text-dark truncate">{fileName}</span>
          ) : (
            <>
              <span className="block text-[13px] font-medium text-muted">Adicionar ficheiro GPX</span>
              <span className="block text-[11px] text-muted-soft">A rota será visível no mapa</span>
            </>
          )}
        </span>
        {fileName && (
          <span
            role="button"
            tabIndex={0}
            onClick={(e) => {
              e.stopPropagation();
              clear();
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.stopPropagation();
                clear();
              }
            }}
            className="w-7 h-7 rounded-full bg-black/10 flex items-center justify-center flex-shrink-0 active:scale-90"
            aria-label="Remover ficheiro GPX"
          >
            <CloseIcon size={13} color="var(--color-muted)" />
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".gpx,application/gpx+xml,application/xml,text/xml"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) {
            setFileName(f.name);
            onFileChange?.(f);
          }
        }}
      />
    </div>
  );
}