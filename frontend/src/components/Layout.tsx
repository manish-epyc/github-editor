import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  const username = sessionStorage.getItem("github_username");
  const navigate = useNavigate();
  const location = useLocation();
  const currentPathname = location.pathname;
  let isEditorPage = false;

  if (
    currentPathname.startsWith("/public/") ||
    currentPathname.startsWith("/repos/")
  ) {
    isEditorPage = true;
  }

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-gray-100 w-full min-h-screen font-sans">
      <div className="font-serif">
        <Header
          username={username}
          handleLogout={handleLogout}
          isEditorPage={isEditorPage}
        />
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
