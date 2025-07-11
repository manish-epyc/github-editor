import GITHUB_LOGO from "../assets/github-logo.svg";
import LOGO from "../assets/logo.svg";
import HAND_AND_SHAKE from "../assets/handshake.svg";
import { useState } from "react";
import { useNavigate } from "react-router";

interface LoginProps {
  showMessage?: string;
}

export default function Login(props: LoginProps) {
  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const REDIRECT_URI = `${import.meta.env.VITE_APP_FRONTEND_URL}/dashboard`; 

  const [openRepo, setOpenRepo] = useState("");
  const navigate = useNavigate();

  const loginWithGitHub = () => {
    // Only request public repository access - no organization access
    const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=public_repo&redirect_uri=${REDIRECT_URI}`;
    window.location.href = githubAuthURL;
  };

  const handleOpenPublicRepo = () => {
    if (!openRepo.trim()) return;

    let owner = "";
    let repo = "";
    let username = "";

    if (openRepo.includes("github.com/")) {
      const match = openRepo.match(/github\.com\/([^\/]+)(?:\/([^\/]+)?)?/);
      if (match) {
        owner = match[1];
        repo = match[2];

        if (!repo) {
          navigate(`/user/${owner}`);
          return;
        } else {
          navigate(`/public/${owner}/${repo}`);
          return;
        }
      }
    } else if (openRepo.includes("/")) {
      const parts = openRepo.split("/");
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
        navigate(`/public/${owner}/${repo}`);
        return;
      }
    } else {
      navigate(`/user/${openRepo}`);
      return;
    }

    alert(
      "Please enter a valid format:\n• GitHub username: 'usernamename'\n• Repository: 'owner/repo'\n• GitHub URL: 'https://github.com/owner/repo'"
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="p-8 text-center">{props.showMessage}</div>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
        {/* Logo */}
        <div className="logos flex items-center justify-center gap-4">
          <img src={LOGO} alt="App Logo" className="w-24 h-24" />
          <img src={HAND_AND_SHAKE} alt="App Logo" className="w-8 h-8" />
          <img src={GITHUB_LOGO} alt="App Logo" className="w-12 h-12" />
        </div>

        {/* Headline */}
        <h1 className="text-xl font-semibold text-gray-800">
          GitHub Repo Editor
        </h1>

        {/* Features List */}
        <ul className="text-sm text-gray-600 space-y-1 text-left list-disc list-inside">
          <li>Open and explore any public GitHub repo</li>
          <li>Edit markdown files in public repositories</li>
          <li>Login to edit your own repositories</li>
          <li>Automatic GitHub sync with every change</li>
        </ul>

        <div>
          <input
            type="text"
            placeholder="e.g. vercel/next.js or github.com/vercel/next.js"
            value={openRepo}
            onChange={(e) => setOpenRepo(e.target.value)}
            className="border p-3 rounded-xl w-full"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleOpenPublicRepo();
              }
            }}
          />
        </div>

        <button
          className="w-full px-6 py-3 text-black border border-gray-300 rounded-xl shadow-md hover:bg-gray-50 transition-all cursor-pointer"
          onClick={handleOpenPublicRepo}
        >
          Browse Public Repositories
        </button>

        <div className="text-gray-500 text-sm">or</div>

        <button
          onClick={loginWithGitHub}
          className="w-full px-6 py-3 text-white bg-black rounded-xl shadow-md hover:opacity-90 transition-all cursor-pointer"
        >
          Login with GitHub to Edit Your Repos
        </button>
      </div>
    </div>
  );
}
