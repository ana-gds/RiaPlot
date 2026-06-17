import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input, PasswordInput, Label } from "../components/ui/Input.jsx";
import { PrimaryButton, TextLink } from "../components/ui/Button.jsx";
import { BackButton } from "../components/ui/BackButton.jsx";
import { ConfirmDialog } from "../components/ui/ConfirmDialog.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { updateUser, deleteAccount, logoutUser } from "../services/api.js";

function LogoutIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SectionTitle({ children }) {
  return <h2 className="text-base font-semibold text-dark mb-3">{children}</h2>;
}

export default function AccountSettings() {
  const navigate = useNavigate();
  const { user, token, login, logout } = useAuth();

  // ── Email ────────────────────────────────────────────────
  const [email, setEmail] = useState(user?.email ?? "");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState(null); // { type, text }

  // ── Palavra-passe ────────────────────────────────────────
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  // ── Conta ────────────────────────────────────────────────
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const setPwField = (field) => (e) => setPw((p) => ({ ...p, [field]: e.target.value }));

  const handleSaveEmail = async () => {
    setEmailMsg(null);
    if (email === user?.email) return;
    setEmailLoading(true);
    try {
      const updated = await updateUser(token, { email });
      login(updated, token);
      setEmailMsg({ type: "ok", text: "Email atualizado." });
    } catch (err) {
      setEmailMsg({ type: "err", text: err?.message ?? "Erro ao atualizar o email." });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwMsg(null);
    if (!pw.current || !pw.next) {
      setPwMsg({ type: "err", text: "Preenche os campos da palavra-passe." });
      return;
    }
    if (pw.next.length < 8) {
      setPwMsg({ type: "err", text: "A nova palavra-passe tem de ter pelo menos 8 caracteres." });
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwMsg({ type: "err", text: "A confirmação não coincide com a nova palavra-passe." });
      return;
    }
    setPwLoading(true);
    try {
      await updateUser(token, { current_password: pw.current, password: pw.next });
      setPw({ current: "", next: "", confirm: "" });
      setPwMsg({ type: "ok", text: "Palavra-passe alterada." });
    } catch (err) {
      setPwMsg({ type: "err", text: err?.message ?? "Erro ao alterar a palavra-passe." });
    } finally {
      setPwLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser(token);
    } catch {
      // ignora falha de rede — termina sempre a sessão localmente
    }
    logout();
    navigate("/login", { replace: true });
  };

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError("");
    try {
      await deleteAccount(token);
      logout();
      navigate("/login", { replace: true });
    } catch (err) {
      setDeleteError(err?.message ?? "Erro ao eliminar a conta.");
      setConfirmDelete(false);
    } finally {
      setDeleting(false);
    }
  };

  const msgClass = (m) => (m.type === "ok" ? "text-secondary" : "text-danger");

  return (
    <>
      <div className="px-4 pt-2 pb-3">
        <BackButton />
      </div>

      <div className="px-4 pt-2">
        <h1 className="text-xl font-bold text-dark">Definições da conta</h1>
        <p className="text-xs text-dark/60 mt-1">Gere o acesso e a segurança da tua conta.</p>
      </div>

      <div className="flex flex-col gap-7 px-4 mt-6 flex-1">
        {/* Email */}
        <section>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          {emailMsg && <p className={`text-xs mt-2 ${msgClass(emailMsg)}`}>{emailMsg.text}</p>}
          <div className="flex justify-center mt-4">
            <PrimaryButton onClick={handleSaveEmail} loading={emailLoading} width={200} height={44}>
              Guardar email
            </PrimaryButton>
          </div>
        </section>

        <div className="h-px bg-divider/70" />

        {/* Palavra-passe */}
        <section>
          <SectionTitle>Alterar palavra-passe</SectionTitle>
          <div className="flex flex-col gap-3">
            <div>
              <Label>Palavra-passe atual</Label>
              <PasswordInput
                value={pw.current}
                onChange={setPwField("current")}
                iconSize={18}
                letterSpacing="2px"
              />
            </div>
            <div>
              <Label>Nova palavra-passe</Label>
              <PasswordInput
                value={pw.next}
                onChange={setPwField("next")}
                iconSize={18}
                letterSpacing="2px"
                placeholder="Mínimo 8 caracteres"
              />
            </div>
            <div>
              <Label>Confirmar nova palavra-passe</Label>
              <PasswordInput
                value={pw.confirm}
                onChange={setPwField("confirm")}
                iconSize={18}
                letterSpacing="2px"
              />
            </div>
          </div>
          {pwMsg && <p className={`text-xs mt-2 ${msgClass(pwMsg)}`}>{pwMsg.text}</p>}
          <div className="flex justify-center mt-4">
            <PrimaryButton onClick={handleChangePassword} loading={pwLoading} width={200} height={44}>
              Alterar palavra-passe
            </PrimaryButton>
          </div>
        </section>

        <div className="h-px bg-divider/70" />

        {/* Sessão */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 w-full py-3 px-4 rounded-2xl border border-divider/70 text-dark/70 active:scale-[0.98] transition-transform"
        >
          <LogoutIcon />
          <span className="text-sm font-medium">Terminar sessão</span>
        </button>
      </div>

      <div className="flex flex-col items-center gap-2 px-4 py-8">
        {deleteError && <p className="text-xs text-danger text-center">{deleteError}</p>}
        <TextLink
          onClick={() => setConfirmDelete(true)}
          className="text-xs text-dark/60 hover:text-danger"
        >
          Eliminar conta
        </TextLink>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar conta"
        message="Esta ação é permanente. A tua conta e todos os dados associados (publicações, embarcações, comentários e notificações) serão eliminados definitivamente. Queres continuar?"
        confirmLabel={deleting ? "A eliminar…" : "Eliminar conta"}
        onConfirm={deleting ? undefined : handleDelete}
        onCancel={() => !deleting && setConfirmDelete(false)}
      />
    </>
  );
}
