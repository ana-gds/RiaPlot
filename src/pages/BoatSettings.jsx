import { useEffect, useState } from "react";
import { IMAGES } from "../constants/images.js";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getBoats, updateBoat, uploadFile } from "../services/api.js";

const numberProps = { type: "number", step: "0.1", min: "0", noSpinner: true, placeholder: "0.0" };

function extractId(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw.$oid ?? String(raw);
  return raw;
}

export default function BoatSettings() {
  const { token } = useAuth();
  const [boatId, setBoatId] = useState(null);
  const [boatPhotoUrl, setBoatPhotoUrl] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
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
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    getBoats(token)
      .then((boats) => {
        const boat = boats[0];
        if (boat) {
          setBoatId(extractId(boat._id ?? boat.id));
          setBoatPhotoUrl(boat.photo_url ?? null);
          setForm({
            nome: boat.name ?? "",
            tipo: boat.type ?? "",
            calado: boat.height ?? "",
            comprimento: boat.length ?? "",
            boca: boat.beam ?? "",
            velocidade: boat.speed ?? "",
            folgaSuperior: boat.upper_clearance ?? "",
            folgaInferior: boat.lower_clearance ?? "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setFetchLoading(false));
  }, [token]);

  const set = (f) => (e) => setForm((p) => ({ ...p, [f]: e.target.value }));

  const handleSave = async () => {
    if (!boatId) return;
    setLoading(true);
    setError("");
    try {
      let photoUrl = boatPhotoUrl;
      if (photoFile) {
        const uploaded = await uploadFile(token, photoFile);
        photoUrl = uploaded.url;
      }
      await updateBoat(token, boatId, {
        name: form.nome,
        type: form.tipo,
        height: parseFloat(form.calado),
        length: parseFloat(form.comprimento),
        beam: parseFloat(form.boca),
        speed: parseFloat(form.velocidade),
        upper_clearance: parseFloat(form.folgaSuperior),
        lower_clearance: parseFloat(form.folgaInferior),
        ...(photoUrl && { photo_url: photoUrl }),
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err?.message ?? "Erro ao guardar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="text-sm text-muted">A carregar…</span>
      </div>
    );
  }

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton />
      </div>

      <div className="flex flex-col items-center gap-2 pt-2">
        <CircleAvatarUpload
          preview={boatPhotoUrl}
          fallbackImage={IMAGES.boats.default}
          onFileChange={setPhotoFile}
          label="Alterar foto"
        />
      </div>

      <div className="flex flex-col gap-3.5 px-4 mt-6 flex-1">
        {error && <p className="text-xs text-danger text-center">{error}</p>}
        {success && <p className="text-xs text-green-600 text-center">Alterações guardadas!</p>}
        <div>
          <Label>Nome da embarcação</Label>
          <Input placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} />
        </div>
        <div>
          <Label>Tipo de embarcação</Label>
          <Input
            placeholder="Ex: Veleiro, Lancha, Caiaque..."
            value={form.tipo}
            onChange={set("tipo")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Calado (m)</Label>
            <Input {...numberProps} value={form.calado} onChange={set("calado")} />
          </div>
          <div>
            <Label>Comprimento (m)</Label>
            <Input {...numberProps} value={form.comprimento} onChange={set("comprimento")} />
          </div>
          <div>
            <Label>Boca (m)</Label>
            <Input {...numberProps} value={form.boca} onChange={set("boca")} />
          </div>
          <div>
            <Label>Velocidade (nós)</Label>
            <Input {...numberProps} value={form.velocidade} onChange={set("velocidade")} />
          </div>
          <div>
            <Label>Folga superior (m)</Label>
            <Input {...numberProps} value={form.folgaSuperior} onChange={set("folgaSuperior")} />
          </div>
          <div>
            <Label>Folga inferior (m)</Label>
            <Input {...numberProps} value={form.folgaInferior} onChange={set("folgaInferior")} />
          </div>
        </div>
      </div>

      <div className="flex justify-center px-4 py-8">
        <PrimaryButton onClick={handleSave} loading={loading} width={200} height={44}>
          Guardar alterações
        </PrimaryButton>
      </div>
    </>
  );
}