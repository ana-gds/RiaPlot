import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Input, Textarea, Select, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { MultiPhotoUpload, GpxUpload } from "../components/ui/PhotoUpload.jsx";
import { LocationInput } from "../components/ui/LocationInput.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { createPost, updatePost, uploadFile, uploadGpx } from "../services/api.js";
import { useRoutes } from "../hooks/useApi.js";
import { parseGpx } from "../utils/gpx.js";

function CharCount({ current, max }) {
  const warn = current > max * 0.9;
  return (
    <div className={`text-[11px] text-right mt-1 ${warn ? "text-warning" : "text-muted-soft"}`}>
      {current}/{max}
    </div>
  );
}

const DESCRIPTION_MAX = 600;

export default function AddPost() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { token } = useAuth();
  const apiRoutes = useRoutes();

  const editPost = state?.editPost ?? null;
  const isEdit = !!editPost;

  const [form, setForm] = useState({
    title: editPost?.title ?? "",
    description: editPost?.description ?? "",
    location: editPost?.location ?? "",
    route: editPost?.route_doc ?? "",
  });
  // Lista ordenada de fotos: cada item é `{ file }` (nova) ou `{ url }` (já
  // existente). Em edição arranca com as fotos atuais do post.
  const [photoItems, setPhotoItems] = useState(() =>
    (editPost?.images ?? []).map((url) => ({ url })),
  );
  const [gpxFile, setGpxFile] = useState(null);
  // Em edição, o GPX só é tocado quando o utilizador escolhe outro ou o remove.
  const [gpxChanged, setGpxChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initialGpxName = editPost?.gpxUrl
    ? decodeURIComponent(editPost.gpxUrl.split("/").pop()) || "rota.gpx"
    : null;

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const canPublish = !!form.title.trim();

  const handlePublish = async () => {
    if (!canPublish) return;
    setLoading(true);
    setError("");
    try {
      // Mantém a ordem: reutiliza URLs já existentes e faz upload apenas das
      // fotos novas (em edição podem coexistir fotos antigas e novas).
      const postUrls = await Promise.all(
        photoItems.map(async (item) =>
          item.url ?? (await uploadFile(token, item.file)).url,
        ),
      );

      let gpxUrl = null;
      let gpxPoints = null;
      if (gpxFile) {
        // Parse no cliente para guardar os pontos da rota (renderizados no mapa
        // sem voltar a descarregar o ficheiro), e guarda também o .gpx original.
        const points = parseGpx(await gpxFile.text());
        if (points.length === 0) {
          throw new Error("Ficheiro GPX inválido ou sem pontos de rota.");
        }
        const gpx = await uploadGpx(token, gpxFile);
        gpxUrl = gpx.url;
        gpxPoints = points;
      }

      if (isEdit) {
        const payload = {
          title: form.title,
          description: form.description,
          location: form.location || null,
          route_doc: form.route || null,
          post_url: postUrls.length > 0 ? postUrls : null,
        };
        // Só mexe no GPX se o utilizador o trocou ou removeu; caso contrário,
        // mantém o do post original.
        if (gpxChanged) {
          payload.gpx_url = gpxUrl;
          payload.gpx_points = gpxPoints;
        }
        await updatePost(token, editPost.id, payload);
        navigate("/social");
        return;
      }

      await createPost(token, {
        title: form.title,
        description: form.description,
        location: form.location || null,
        route_doc: form.route || null,
        post_url: postUrls.length > 0 ? postUrls : null,
        gpx_url: gpxUrl,
        gpx_points: gpxPoints,
      });
      navigate("/social");
    } catch (err) {
      // Mostra erros de validação do Laravel (err.errors) quando existirem.
      const firstFieldError = err?.errors ? Object.values(err.errors)[0]?.[0] : null;
      setError(firstFieldError ?? err?.message ?? "Erro ao publicar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center px-4 flex-shrink-0 h-12 relative">
        <BackButton />
        <h1 className="absolute inset-x-0 text-center text-lg font-bold text-dark pointer-events-none">
          {isEdit ? "Editar Post" : "Novo Post"}
        </h1>
      </div>

      <div className="flex-1 px-4 pt-4 pb-6 overflow-y-auto flex flex-col gap-5">
        <MultiPhotoUpload
          onChange={setPhotoItems}
          initialImages={isEdit ? (editPost?.images ?? []) : []}
        />

        {error && <p className="text-xs text-danger text-center -my-1">{error}</p>}

        <div>
          <Label>Título</Label>
          <Input
            placeholder="Ex: Manhã de passeio na ria"
            value={form.title}
            onChange={set("title")}
            maxLength={60}
          />
          <CharCount current={form.title.length} max={60} />
        </div>

        <div>
          <Label>Descrição</Label>
          <Textarea
            placeholder="Conta a tua experiência..."
            value={form.description}
            onChange={set("description")}
            maxLength={DESCRIPTION_MAX}
          />
          <CharCount current={form.description.length} max={DESCRIPTION_MAX} />
        </div>

        <div>
          <Label>Localização</Label>
          <LocationInput
            placeholder="Ex: Costa Nova, Aveiro"
            value={form.location}
            onChange={(loc) => setForm((p) => ({ ...p, location: loc }))}
          />
        </div>

        <div>
          <Label>
            Associar rota{" "}
            <span className="font-normal text-muted-soft">(opcional)</span>
          </Label>
          <Select value={form.route} onChange={set("route")}>
            <option value="">Nenhuma rota</option>
            {apiRoutes.map((r) => (
              <option key={r._id} value={r._id}>
                {r.nome}
              </option>
            ))}
          </Select>
        </div>

        <div>
          <Label>
            Rota percorrida (GPX){" "}
            <span className="font-normal text-muted-soft">(opcional)</span>
          </Label>
          <GpxUpload
            initialName={initialGpxName}
            onFileChange={(f) => {
              setGpxFile(f);
              setGpxChanged(true);
            }}
          />
        </div>
      </div>

      <div className="px-4 py-4 pb-8 flex-shrink-0">
        <PrimaryButton onClick={handlePublish} disabled={!canPublish} loading={loading} className="w-full">
          {isEdit ? "Guardar alterações" : "Publicar"}
        </PrimaryButton>
      </div>
    </>
  );
}