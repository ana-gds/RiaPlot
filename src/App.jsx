import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AppShell, PageShell } from "./layouts/AppLayout.jsx";
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
import MapPage from "./pages/Map.jsx";

const DEV_PAGES = [
  ["/login", "Login"],
  ["/register/profile", "Criar conta"],
  ["/register/boat", "Embarcação"],
  ["/register/final", "Concluir registo"],
  ["/routes", "Rotas"],
  ["/routes/detail", "Detalhe rota"],
  ["/social", "Social"],
  ["/social/post", "Detalhe post"],
  ["/social/new", "Novo post"],
  ["/notifications", "Notificações"],
  ["/profile", "Perfil"],
  ["/profile/edit", "Editar perfil"],
  ["/profile/boat", "Definições embarcação"],
];

function DevPicker() {
  const navigate = useNavigate();
  if (!import.meta.env.DEV) return null;
  return (
    <select
      onChange={(e) => navigate(e.target.value)}
      defaultValue=""
      className="fixed top-2 right-2 z-50 text-xs px-2 py-1 rounded shadow bg-dark text-white border-0 cursor-pointer"
      aria-label="Dev page picker"
    >
      <option value="" disabled>
        Ir para…
      </option>
      {DEV_PAGES.map(([path, label]) => (
        <option key={path} value={path}>
          {label}
        </option>
      ))}
    </select>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-frame">
        <DevPicker />
        <Routes>
          {/* Tab pages share the bottom navigation */}
          <Route element={<AppShell />}>
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/social" element={<Social />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Stand-alone screens (auth, detail, settings) — no bottom nav */}
          <Route element={<PageShell />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register/profile" element={<ProfileRegister />} />
            <Route path="/register/boat" element={<BoatRegister />} />
            <Route path="/register/final" element={<FinalRegister />} />
            <Route path="/routes/detail" element={<RouteDetail />} />
            <Route path="/social/post" element={<PostDetail />} />
            <Route path="/social/new" element={<AddPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/boat" element={<BoatSettings />} />
            <Route path="/map" element={<MapPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/routes" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}