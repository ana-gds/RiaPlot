import { useState } from "react";
import Login from "./pages/Login.jsx";
import ProfileRegister from "./pages/ProfileRegister.jsx";
import BoatRegister from "./pages/BoatRegister.jsx";
import FinalRegister from "./pages/FinalRegister.jsx";
import Routes from "./pages/Routes.jsx";
import RouteDetail from "./pages/RouteDetail.jsx";
import Social from "./pages/Social.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import AddPost from "./pages/AddPost.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import BoatSettings from "./pages/BoatSettings.jsx";

const PAGES = {
  login: "Login",
  "profile-register": "Criar conta",
  "boat-register": "Embarcação",
  "final-register": "Concluir registo",
  routes: "Rotas",
  "route-detail": "Detalhe rota",
  social: "Social",
  "post-detail": "Detalhe post",
  "add-post": "Novo post",
  notifications: "Notificações",
  profile: "Perfil",
  "edit-profile": "Editar perfil",
  "boat-settings": "Definições embarcação",
};

const TAB_TO_PAGE = {
  rotas: "routes",
  social: "social",
  notificacoes: "notifications",
  mapa: "routes",
};

function DevPicker({ current, onPick }) {
  return (
    <select
      value={current}
      onChange={(e) => onPick(e.target.value)}
      className="fixed top-2 right-2 z-[1000] text-xs px-2 py-1 rounded shadow"
      style={{ background: "#0e2c38", color: "white", border: "none", cursor: "pointer" }}
    >
      {Object.entries(PAGES).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default function App() {
  const [page, setPage] = useState("routes");

  const onChangeTab = (tabKey) => {
    const next = TAB_TO_PAGE[tabKey];
    if (next) setPage(next);
  };

  const renderPage = () => {
    switch (page) {
      case "login":
        return <Login />;
      case "profile-register":
        return <ProfileRegister onContinue={() => setPage("boat-register")} />;
      case "boat-register":
        return <BoatRegister onContinue={() => setPage("final-register")} />;
      case "final-register":
        return (
          <FinalRegister
            onStart={() => setPage("routes")}
            onExplore={() => setPage("routes")}
          />
        );
      case "routes":
        return (
          <Routes
            onOpenMenu={() => setPage("profile")}
            onOpenRoute={() => setPage("route-detail")}
            activeTab="rotas"
            onChangeTab={onChangeTab}
          />
        );
      case "route-detail":
        return <RouteDetail onBack={() => setPage("routes")} />;
      case "social":
        return (
          <Social
            onOpenMenu={() => setPage("profile")}
            onOpenPost={() => setPage("post-detail")}
            onCreatePost={() => setPage("add-post")}
            activeTab="social"
            onChangeTab={onChangeTab}
          />
        );
      case "post-detail":
        return <PostDetail onBack={() => setPage("social")} />;
      case "add-post":
        return <AddPost onBack={() => setPage("social")} />;
      case "notifications":
        return <Notifications activeTab="notificacoes" onChangeTab={onChangeTab} />;
      case "profile":
        return (
          <Profile
            onBack={() => setPage("routes")}
            onEditProfile={() => setPage("edit-profile")}
          />
        );
      case "edit-profile":
        return <EditProfile onBack={() => setPage("profile")} />;
      case "boat-settings":
        return <BoatSettings onBack={() => setPage("profile")} />;
      default:
        return <Routes activeTab="rotas" onChangeTab={onChangeTab} />;
    }
  };

  return (
    <div className="w-full min-h-screen">
      {renderPage()}
      <DevPicker current={page} onPick={setPage} />
    </div>
  );
}
