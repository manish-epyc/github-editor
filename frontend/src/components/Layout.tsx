import type { ReactNode } from "react";
import { Link, useNavigate } from "react-router";

export default function Layout({ children }: { children: ReactNode }) {
  const username = sessionStorage.getItem("github_username");
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.clear();
    navigate("/");
  };

  return (
    <div className="bg-gray-100 w-full">
      <div className=" max-w-7xl mx-auto font-serif pt-4">
        <header className="flex items-center justify-between px-6 py-6 bg-white rounded-md text-black shadow-md">
          <div className="text-xl font-semibold">EPYC GitHub Editor</div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="text-xl font-bold">Hi, {username}</span>
            )}
            <button
              onClick={handleLogout}
              className="text-sm bg-red-400 px-3 py-2 text-white rounded-md hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
