import GITHUB_LOGO from "../assets/github-logo.svg";
import LOGO from "../assets/logo.svg";
import HAND_AND_SHAKE from "../assets/handshake.svg";

export default function Login(props) {
  const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
  const REDIRECT_URI = `${import.meta.env.VITE_APP_FRONTEND_URL}/dashboard`; // frontend handles the code

  const loginWithGitHub = () => {
    const githubAuthURL = `https://github.com/login/oauth/authorize?client_id=${GITHUB_CLIENT_ID}&scope=repo&redirect_uri=${REDIRECT_URI}`;
    window.location.href = githubAuthURL;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 px-4">
      <div className="p-8 text-center">{props.showMessage}</div>
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md text-center space-y-6">
        {/* Logo */}

        <div className="logos flex items-center justify-center gap-4">
          <img src={LOGO} alt="App Logo" className="w-24 h-24" />
          <img src={HAND_AND_SHAKE} alt="App Logo" className="w-8 h-8" />
          <img src={GITHUB_LOGO} alt="App Logo" className="w-12 h-12    " />
        </div>

        {/* Headline */}
        <h1 className="text-xl font-semibold text-gray-800">
          GitHub Repo Editor
        </h1>

        {/* Features List */}
        <ul className="text-sm text-gray-600 space-y-1 text-left list-disc list-inside">
          <li>Open and explore any public GitHub repo</li>
          <li>Edit your own repositories in real-time</li>
          <li>Automatic GitHub sync with every change</li>
        </ul>

        {/* Login Button */}
        <button
          onClick={loginWithGitHub}
          className="w-full px-6 py-3 text-white bg-black rounded-xl shadow-md hover:opacity-90 transition-all"
        >
          Login with GitHub
        </button>
      </div>
    </div>
  );
}
