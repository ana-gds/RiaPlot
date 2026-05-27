import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, Textarea, Select, Label } from "../components/ui/Input.jsx";
import { PrimaryButton } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { RectanglePhotoUpload } from "../components/ui/PhotoUpload.jsx";
import { PinIcon } from "../components/ui/Icons.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { createPost, uploadFile } from "../services/api.js";
import { useRoutes } from "../hooks/useApi.js";

function CharCount({ current, max }) {
  const warn = current > max * 0.9;
  return (
    <div className={`text-[11px] text-right mt-1 ${warn ? "text-warning" : "text-muted-soft"}`}>
      {current}/{max}
    </div>
  );
}

export default function AddPost() {
  const navigate = useNavigate();
  const { token } = useAuth();
  const apiRoutes = useRoutes();

  const [form, setForm] = useState({ title: "", description: "", location: "", route: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const canPublish = !!form.title.trim();

  const handlePublish = async () => {
    if (!canPublish) return;
    setLoading(true);
    setError("");
    try {
      let postUrls = [];
      if (photoFile) {
        const uploaded = await uploadFile(token, photoFile);
        postUrls = [uploaded.url];
      }
      await createPost(token, {
        title: form.title,
        description: form.description,
        location: form.location || null,
        route_doc: form.route || null,
        post_url: postUrls.length > 0 ? postUrls : null,
      });
      navigate("/social");
    } catch (err) {
      setError(err?.message ?? "Erro ao publicar. Tenta novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center px-4 flex-shrink-0 h-12 relative">
        <BackButton />
        <h1 className="absolute inset-x-0 text-center text-lg font-bold text-dark pointer-events-none">
          Novo Post
        </h1>
      </div>

      <div className="flex-1 px-4 pt-4 overflow-y-auto flex flex-col">
        <div className="mb-5">
          <RectanglePhotoUpload onFileChange={setPhotoFile} />
        </div>

        {error && <p className="text-xs text-danger text-center mb-3">{error}</p>}

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
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">
              <PinIcon size={16} color="currentColor" />
            </span>
            <Input
              placeholder="Ex: Costa Nova, Aveiro"
              value={form.location}
              onChange={set("location")}
              className="pl-10"
            />
          </div>
        </div>

        <div className="mb-4">
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
      </div>

      <div className="px-4 py-4 pb-8 flex-shrink-0">
        <PrimaryButton onClick={handlePublish} disabled={!canPublish} loading={loading} className="w-full">
          Publicar
        </PrimaryButton>
      </div>
    </>
  );
}