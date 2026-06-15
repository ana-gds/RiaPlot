import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext.jsx";
import { NotificationsProvider } from "./contexts/NotificationsContext.jsx";
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
import PublicProfile from "./pages/PublicProfile.jsx";
import EditProfile from "./pages/EditProfile.jsx";
import BoatSettings from "./pages/BoatSettings.jsx";
import MapPage from "./pages/Map.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationsProvider>
        <div className="app-frame">
          <Routes>
          {/* Tab pages share the bottom navigation */}
          <Route element={<AppShell />}>
            <Route path="/routes" element={<RoutesPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/social" element={<Social />} />
            <Route path="/notifications" element={<Notifications />} />
          </Route>

          {/* Stand-alone screens (auth, detail, settings) — no bottom nav */}
          <Route element={<PageShell />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register/profile" element={<ProfileRegister />} />
            <Route path="/register/boat" element={<BoatRegister />} />
            <Route path="/register/final" element={<FinalRegister />} />
            <Route path="/routes/:id" element={<RouteDetail />} />
            <Route path="/social/post" element={<PostDetail />} />
            <Route path="/social/new" element={<AddPost />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/users/:id" element={<PublicProfile />} />
            <Route path="/profile/edit" element={<EditProfile />} />
            <Route path="/profile/boat" element={<BoatSettings />} />
          </Route>

          <Route path="*" element={<Navigate to="/routes" replace />} />
          </Routes>
        </div>
        </NotificationsProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}