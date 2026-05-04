import { useState } from "react";
import { COLORS, FONTS } from "../constants/theme.js";
import { Input, Textarea, Select, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { RectanglePhotoUpload } from "../components/ui/PhotoUpload.jsx";
import { PinIcon } from "../components/ui/Icons.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

function CharCount({ current, max }) {
  return (
    <div
      className="text-[11px] text-right mt-1"
      style={{ color: current > max * 0.9 ? "#f57c00" : COLORS.mutedSoft }}
    >
      {current}/{max}
    </div>
  );
}

export default function AddPost({ onBack }) {
  const [form, setForm] = useState({ title: "", description: "", location: "", route: "" });
  const [photoPreview, setPhotoPreview] = useState(null);
  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const canPublish = !!form.title.trim() && !!photoPreview;

  const handlePublish = () => {
    if (!canPublish) return;
    console.log("Publicar:", { ...form, photo: photoPreview });
  };

  return (
    <PageShell>
      <div className="flex items-center px-4 flex-shrink-0 h-11">
        <BackButton onClick={onBack} />
        <span
          className="flex-1 text-center text-lg font-bold mr-10"
          style={{ color: COLORS.dark, fontFamily: FONTS.manrope }}
        >
          Novo Post
        </span>
      </div>

      <div className="flex-1 px-4 pt-5 overflow-y-auto flex flex-col">
        <div className="mb-5">
          <RectanglePhotoUpload preview={photoPreview} onFileChange={setPhotoPreview} />
        </div>

        <div className="mb-4">
          <Label>Título</Label>
          <Input
            placeholder="Ex: Manhã de passeio na ria"
            value={form.title}
            onChange={set("title")}
            maxLength={60}
          />
          <CharCount current={form.title.length} max={60} />
        </div>

        <div className="mb-4">
          <Label>Descrição</Label>
          <Textarea
            placeholder="Conta a tua experiência..."
            value={form.description}
            onChange={set("description")}
            maxLength={300}
          />
          <CharCount current={form.description.length} max={300} />
        </div>

        <div className="mb-4">
          <Label>Localização</Label>
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: COLORS.muted }}
            >
              <PinIcon size={16} color="currentColor" />
            </span>
            <Input
              placeholder="Ex: Costa Nova, Aveiro"
              value={form.location}
              onChange={set("location")}
              style={{ paddingLeft: "38px" }}
            />
          </div>
        </div>

        <div className="mb-4">
          <Label>
            Associar rota{" "}
            <span style={{ color: COLORS.mutedSoft, fontWeight: 400 }}>(opcional)</span>
          </Label>
          <Select value={form.route} onChange={set("route")}>
            <option value="">Nenhuma rota</option>
            <option value="1">Rio Novo do Príncipe</option>
            <option value="2">Canal Central</option>
            <option value="3">Costa Nova - Barra</option>
          </Select>
        </div>
      </div>

      <div className="px-4 py-4 pb-8 flex-shrink-0">
        <PrimaryButton onClick={handlePublish} disabled={!canPublish} className="w-full">
          Publicar
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
