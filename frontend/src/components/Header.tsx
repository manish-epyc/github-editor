import { Link } from "react-router";

interface HeaderProps {
  username?: string | null;
  handleLogout: () => void;
}

function Header({ username, handleLogout }: HeaderProps) {
  return (
    <header className="py-6 bg-white rounded-md text-black border-b border-gray-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        <div className="text-2xl font-semibold">
          <Link to={username ? "/repos" : "/"} className="hover:text-blue-600 font-sans">
            EPYC GitHub Editor
          </Link>
        </div>
        <div className="flex items-center gap-4 font-sans">
          {username ? (
            <>
              <span className="text-lg font-medium">Hi, {username}</span>
              <button
                onClick={handleLogout}
                className="text-sm bg-red-400 px-3 py-2 text-white rounded-md hover:bg-red-500 transition-colors font-sans"
              >
                Logout
              </button>
            </>
          ) : (
            <Link
              to="/"
              className="text-sm bg-blue-600 px-4 py-2 text-white rounded-md hover:bg-blue-700 transition-colors font-sans"
            >
              Login with GitHub
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;