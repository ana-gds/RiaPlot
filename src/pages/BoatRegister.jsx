import { useState } from "react";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { ProgressIndicator } from "../components/shared/ProgressIndicator.jsx";
import { PageShell } from "../layouts/AppLayout.jsx";

export default function BoatRegister({ onContinue }) {
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
    console.log("Registar embarcação:", form);
    onContinue?.();
  };

  const numberProps = { type: "number", step: "0.1", min: "0", noSpinner: true, placeholder: "0.0" };

  return (
    <PageShell>
      <ProgressIndicator step={2} />

      <div className="mt-8 flex-shrink-0">
        <CircleAvatarUpload preview={boatPreview} onFileChange={setBoatPreview} />
      </div>

      <div className="flex-1 px-4 mt-5 flex flex-col gap-0 overflow-y-auto">
        <div className="mb-3">
          <Label>Nome da embarcação</Label>
          <Input placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} />
        </div>
        <div className="mb-3">
          <Label>Tipo de embarcação</Label>
          <Input placeholder="Ex: Veleiro, Lancha, Caiaque..." value={form.tipo} onChange={set("tipo")} />
        </div>

        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <Label>Calado (m)</Label>
            <Input {...numberProps} value={form.calado} onChange={set("calado")} />
          </div>
          <div className="flex-1">
            <Label>Comprimento (m)</Label>
            <Input {...numberProps} value={form.comprimento} onChange={set("comprimento")} />
          </div>
        </div>

        <div className="flex gap-4 mb-3">
          <div className="flex-1">
            <Label>Boca (m)</Label>
            <Input {...numberProps} value={form.boca} onChange={set("boca")} />
          </div>
          <div className="flex-1">
            <Label>Velocidade (nós)</Label>
            <Input {...numberProps} value={form.velocidade} onChange={set("velocidade")} />
          </div>
        </div>

        <div className="flex gap-4 mb-3">
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

      <div className="flex justify-center px-5 py-4 pb-8 flex-shrink-0">
        <PrimaryButton onClick={handleContinue} width={188} height={40} className="text-[15px]">
          Continuar
        </PrimaryButton>
      </div>
    </PageShell>
  );
}
