import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { IMAGES } from "../constants/images.js";
import { Input, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { CircleAvatarUpload } from "../components/ui/PhotoUpload.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { getBoats, updateBoat, uploadFile } from "../services/api.js";

const numberProps = { type: "number", step: "0.1", min: "0", noSpinner: true, placeholder: "0.0" };

// Campos obrigatórios. Os que não são `nome`/`tipo` são numéricos e têm de ser
// um número válido >= 0.
const TEXT_FIELDS = ["nome", "tipo"];
const REQUIRED_FIELDS = [
  "nome", "tipo", "calado", "comprimento", "boca",
  "velocidade", "folgaSuperior", "folgaInferior",
];

function validateForm(form) {
  const errors = {};
  for (const key of REQUIRED_FIELDS) {
    const value = String(form[key] ?? "").trim();
    if (value === "") {
      errors[key] = true;
    } else if (!TEXT_FIELDS.includes(key) && !(parseFloat(value) >= 0)) {
      errors[key] = true;
    }
  }
  return errors;
}

function extractId(raw) {
  if (!raw) return null;
  if (typeof raw === 'object') return raw.$oid ?? String(raw);
  return raw;
}

export default function BoatSettings() {
  const { token } = useAuth();
  const navigate = useNavigate();
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
  const [fieldErrors, setFieldErrors] = useState({});

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

  const set = (f) => (e) => {
    setForm((p) => ({ ...p, [f]: e.target.value }));
    // Limpa o erro do campo assim que o utilizador o corrige.
    setFieldErrors((p) => (p[f] ? { ...p, [f]: false } : p));
  };

  const handleSave = async () => {
    if (!boatId) return;

    const errors = validateForm(form);
    if (Object.keys(errors).some((k) => errors[k])) {
      setFieldErrors(errors);
      setError("Preenche todos os campos antes de guardar.");
      return;
    }

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
      // Guardado com sucesso — volta à página anterior.
      navigate(-1);
    } catch (err) {
      setError(err?.message ?? "Erro ao guardar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  // Borda vermelha (com !important para vencer a borda base do Input) quando o
  // campo está marcado como inválido.
  const errClass = (f) => (fieldErrors[f] ? "border-danger!" : "");

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
        <div>
          <Label>Nome da embarcação</Label>
          <Input placeholder="Ex: Gaivota" value={form.nome} onChange={set("nome")} className={errClass("nome")} />
        </div>
        <div>
          <Label>Tipo de embarcação</Label>
          <Input
            placeholder="Ex: Veleiro, Lancha, Caiaque..."
            value={form.tipo}
            onChange={set("tipo")}
            className={errClass("tipo")}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>Calado (m)</Label>
            <Input {...numberProps} value={form.calado} onChange={set("calado")} className={errClass("calado")} />
          </div>
          <div>
            <Label>Comprimento (m)</Label>
            <Input {...numberProps} value={form.comprimento} onChange={set("comprimento")} className={errClass("comprimento")} />
          </div>
          <div>
            <Label>Boca (m)</Label>
            <Input {...numberProps} value={form.boca} onChange={set("boca")} className={errClass("boca")} />
          </div>
          <div>
            <Label>Velocidade (nós)</Label>
            <Input {...numberProps} value={form.velocidade} onChange={set("velocidade")} className={errClass("velocidade")} />
          </div>
          <div>
            <Label>Folga superior (m)</Label>
            <Input {...numberProps} value={form.folgaSuperior} onChange={set("folgaSuperior")} className={errClass("folgaSuperior")} />
          </div>
          <div>
            <Label>Folga inferior (m)</Label>
            <Input {...numberProps} value={form.folgaInferior} onChange={set("folgaInferior")} className={errClass("folgaInferior")} />
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