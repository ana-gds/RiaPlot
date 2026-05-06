import { useState } from "react";
import { IMAGES } from "../constants/images.js";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function BoatSettings({ onBack }) {
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
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));
  const numberProps = { type: "number", step: "0.1", min: "0", noSpinner: true, placeholder: "0.0" };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Replace with real API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      console.log("save", form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <div className="absolute left-4 top-12 z-10">
        <BackButton onClick={onBack} />
      </div>

      <div className="flex flex-col items-center gap-2 pt-12">
        {/* Reusing shared CircleAvatarUpload instead of duplicating the logic */}
        <CircleAvatarUpload
          preview={preview}
          fallbackImage={IMAGES.boats.default}
          onFileChange={setPreview}
          label="Alterar foto"
        />
      </div>

      <div className="flex flex-col gap-3.5 px-4 mt-6 flex-1">
        <div>
          <Label>Nome da embarcação</Label>
          <Input placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} />
        </div>
        <div>
          <Label>Tipo de embarcação</Label>
          <Input placeholder="Ex: Veleiro, Lancha, Caiaque..." value={form.tipo} onChange={set("tipo")} />
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Calado (m)</Label>
            <Input {...numberProps} value={form.calado} onChange={set("calado")} />
          </div>
          <div className="flex-1">
            <Label>Comprimento (m)</Label>
            <Input {...numberProps} value={form.comprimento} onChange={set("comprimento")} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Boca (m)</Label>
            <Input {...numberProps} value={form.boca} onChange={set("boca")} />
          </div>
          <div className="flex-1">
            <Label>Velocidade (nós)</Label>
            <Input {...numberProps} value={form.velocidade} onChange={set("velocidade")} />
          </div>
        </div>
        <div className="flex gap-4">
          <div className="flex-1">
            <Label>Folga superior (m)</Label>
            <Input {...numberProps} value={form.folgaSuperior} onChange={set("folgaSuperior")} />
          </div>
          <div className="flex-1">
            <Label>Folga inferior (m)</Label>
            <Input {...numberProps} value={form.folgaInferior} onChange={set("folgaInferior")} />
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 py-8 mt-4">
        <PrimaryButton
          onClick={handleSave}
          loading={loading}
          width={188}
          height={40}
          className="text-[15px]"
        >
          Guardar alterações
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
