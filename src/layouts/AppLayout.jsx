import { StatusBar } from "../components/ui/StatusBar.jsx";
import { BottomNav } from "../components/shared/BottomNav.jsx";

export function AppLayout({ children, activeTab, onChangeTab, withNav = true, withStatusBar = true }) {
  return (
    <div className="bg-white relative w-full min-h-screen flex flex-col">
      {withStatusBar && <StatusBar />}
      <div className="flex-1 flex flex-col min-h-0">{children}</div>
      {withNav && <BottomNav active={activeTab} onChange={onChangeTab} />}
    </div>
  );
}

export function PageShell({ children, withStatusBar = true }) {
  return (
    <div className="bg-white relative w-full min-h-screen flex flex-col">
      {withStatusBar && <StatusBar />}
      {children}
    </div>
  );
}
