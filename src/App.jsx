import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import ProfileRegister from "./pages/ProfileRegister.jsx";
import BoatRegister from "./pages/BoatRegister.jsx";
import FinalRegister from "./pages/FinalRegister.jsx";
import RoutesPage from "./pages/Routes.jsx";
import RouteDetail from "./pages/RouteDetail.jsx";
import Social from "./pages/Social.jsx";
import PostDetail from "./pages/PostDetail.jsx";
import AddPost from "./pages/AddPost.jsx";
import Notifications from "./pages/Notifications.jsx";
import Profile from "./pages/Profile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import BoatSettings from "./pages/BoatSettings.jsx";

const TAB_TO_PATH = {
  rotas: "/routes",
  social: "/social",
  notificacoes: "/notifications",
  mapa: "/routes",
};

// Only rendered in development builds
function DevPicker() {
  const navigate = useNavigate();
  if (!import.meta.env.DEV) return null;

  const PAGES = {
    "/login": "Login",
    "/register/profile": "Criar conta",
    "/register/boat": "Embarcação",
    "/register/final": "Concluir registo",
    "/routes": "Rotas",
    "/routes/detail": "Detalhe rota",
    "/social": "Social",
    "/social/post": "Detalhe post",
    "/social/new": "Novo post",
    "/notifications": "Notificações",
    "/profile": "Perfil",
    "/profile/edit": "Editar perfil",
    "/profile/boat": "Definições embarcação",
  };

  return (
    <select
      onChange={(e) => navigate(e.target.value)}
      className="fixed top-2 right-2 z-[1000] text-xs px-2 py-1 rounded shadow"
      style={{ background: "#0e2c38", color: "white", border: "none", cursor: "pointer" }}
    >
      {Object.entries(PAGES).map(([path, label]) => (
        <option key={path} value={path}>
          {label}
        </option>
      ))}
    </select>
  );
}

function AppRoutes() {
  const navigate = useNavigate();
  const changeTab = (tabKey) => {
    const path = TAB_TO_PATH[tabKey];
    if (path) navigate(path);
  };

  return (
    <>
      <DevPicker />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/register/profile"
          element={<ProfileRegister onContinue={() => navigate("/register/boat")} />}
        />
        <Route
          path="/register/boat"
          element={<BoatRegister onContinue={() => navigate("/register/final")} />}
        />
        <Route
          path="/register/final"
          element={
            <FinalRegister
              onStart={() => navigate("/routes")}
              onExplore={() => navigate("/routes")}
            />
          }
        />
        <Route
          path="/routes"
          element={
            <RoutesPage
              onOpenMenu={() => navigate("/profile")}
              onOpenRoute={() => navigate("/routes/detail")}
              activeTab="rotas"
              onChangeTab={changeTab}
            />
          }
        />
        <Route
          path="/routes/detail"
          element={<RouteDetail onBack={() => navigate("/routes")} />}
        />
        <Route
          path="/social"
          element={
            <Social
              onOpenMenu={() => navigate("/profile")}
              onOpenPost={() => navigate("/social/post")}
              onCreatePost={() => navigate("/social/new")}
              activeTab="social"
              onChangeTab={changeTab}
            />
          }
        />
        <Route
          path="/social/post"
          element={<PostDetail onBack={() => navigate("/social")} />}
        />
        <Route
          path="/social/new"
          element={<AddPost onBack={() => navigate("/social")} />}
        />
        <Route
          path="/notifications"
          element={<Notifications activeTab="notificacoes" onChangeTab={changeTab} />}
        />
        <Route
          path="/profile"
          element={
            <Profile
              onBack={() => navigate("/routes")}
              onEditProfile={() => navigate("/profile/edit")}
            />
          }
        />
        <Route
          path="/profile/edit"
          element={<EditProfile onBack={() => navigate("/profile")} />}
        />
        <Route
          path="/profile/boat"
          element={<BoatSettings onBack={() => navigate("/profile")} />}
        />
        {/* Catch-all: redirect unknown paths to routes */}
        <Route path="*" element={<Navigate to="/routes" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="w-full min-h-screen">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
