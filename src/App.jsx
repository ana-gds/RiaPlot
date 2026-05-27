import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
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

function RequireAuth({ children }) {
  const { token } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function RequireGuest({ children }) {
  const { token } = useAuth();
  if (token) return <Navigate to="/routes" replace />;
  return children;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app-frame">
          <Routes>
            {/* Tab pages — require auth, share bottom nav */}
            <Route element={<RequireAuth><AppShell /></RequireAuth>}>
              <Route path="/routes" element={<RoutesPage />} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/social" element={<Social />} />
              <Route path="/notifications" element={<Notifications />} />
            </Route>

            {/* Stand-alone pages without navigation */}
            <Route element={<PageShell />}>
              {/* Guest-only */}
              <Route path="/login" element={<RequireGuest><Login /></RequireGuest>} />
              <Route path="/register/profile" element={<RequireGuest><ProfileRegister /></RequireGuest>} />
              <Route path="/register/boat" element={<BoatRegister />} />
              <Route path="/register/final" element={<FinalRegister />} />

              {/* Auth-required detail / settings pages */}
              <Route path="/routes/:id" element={<RequireAuth><RouteDetail /></RequireAuth>} />
              <Route path="/social/post" element={<RequireAuth><PostDetail /></RequireAuth>} />
              <Route path="/social/new" element={<RequireAuth><AddPost /></RequireAuth>} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/profile/edit" element={<RequireAuth><EditProfile /></RequireAuth>} />
              <Route path="/profile/boat" element={<RequireAuth><BoatSettings /></RequireAuth>} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
