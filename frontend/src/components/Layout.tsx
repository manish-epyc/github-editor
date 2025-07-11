import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import Header from "./Header";

export default function Layout({ children }: { children: ReactNode }) {
  const username = sessionStorage.getItem("github_username");
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-gray-100 w-full min-h-screen font-sans">
      <div className="font-serif">
        <Header username={username} handleLogout={handleLogout} />
        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}