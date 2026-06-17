import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationsProvider } from "./contexts/NotificationsContext.jsx";
import { AppShell, PageShell } from "./layouts/AppLayout.jsx";
import { useAuth } from "./contexts/AuthContext.jsx";

// Cada página é um chunk separado (carregamento preguiçoso). Assim o arranque
// só transfere o código da primeira página visitada — o pesado (mapa/Leaflet,
// detalhe de publicações…) só é descarregado quando o utilizador lá chega.
const Login = lazy(() => import("./pages/Login.jsx"));
const ProfileRegister = lazy(() => import("./pages/ProfileRegister.jsx"));
const BoatRegister = lazy(() => import("./pages/BoatRegister.jsx"));
const FinalRegister = lazy(() => import("./pages/FinalRegister.jsx"));
const RoutesPage = lazy(() => import("./pages/Routes.jsx"));
const RouteDetail = lazy(() => import("./pages/RouteDetail.jsx"));
const Social = lazy(() => import("./pages/Social.jsx"));
const PostDetail = lazy(() => import("./pages/PostDetail.jsx"));
const AddPost = lazy(() => import("./pages/AddPost.jsx"));
const Notifications = lazy(() => import("./pages/Notifications.jsx"));
const Profile = lazy(() => import("./pages/Profile.jsx"));
const PublicProfile = lazy(() => import("./pages/PublicProfile.jsx"));
const EditProfile = lazy(() => import("./pages/EditProfile.jsx"));
const AccountSettings = lazy(() => import("./pages/AccountSettings.jsx"));
const Privacy = lazy(() => import("./pages/Privacy.jsx"));
const Help = lazy(() => import("./pages/Help.jsx"));
const BoatSettings = lazy(() => import("./pages/BoatSettings.jsx"));
const MapPage = lazy(() => import("./pages/Map.jsx"));

function PageFallback() {
  return (
    <div className="flex-1 flex items-center justify-center py-16">
      <span className="text-sm text-muted">A carregar…</span>
    </div>
  );
}

// Protege páginas que exigem sessão: um visitante (sem token) é levado ao login.
function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
        <div className="app-frame">
          <Suspense fallback={<PageFallback />}>
          <Routes>
          {/* Tab pages share the bottom navigation */}
          <Route element={<AppShell />}>
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/social" element={<Social />} />
            <Route path="/notifications" element={<RequireAuth><Notifications /></RequireAuth>} />
          </Route>

          {/* Stand-alone screens (auth, detail, settings) — no bottom nav */}
          <Route element={<PageShell />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register/profile" element={<ProfileRegister />} />
            <Route path="/register/boat" element={<BoatRegister />} />
            <Route path="/register/final" element={<FinalRegister />} />
            <Route path="/routes/:id" element={<RouteDetail />} />
            <Route path="/social/post" element={<PostDetail />} />
            <Route path="/social/new" element={<RequireAuth><AddPost /></RequireAuth>} />
            <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
            <Route path="/users/:id" element={<RequireAuth><PublicProfile /></RequireAuth>} />
            <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
            <Route path="/profile/settings" element={<RequireAuth><AccountSettings /></RequireAuth>} />
            <Route path="/profile/privacy" element={<RequireAuth><Privacy /></RequireAuth>} />
            <Route path="/profile/help" element={<Help />} />
            <Route path="/profile/boat" element={<RequireAuth><BoatSettings /></RequireAuth>} />
          </Route>

          <Route path="*" element={<Navigate to="/routes" replace />} />
          </Routes>
          </Suspense>
        </div>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
