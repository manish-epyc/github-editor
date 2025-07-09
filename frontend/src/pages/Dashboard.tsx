import { useEffect } from "react";
import { useNavigate } from "react-router";
import Login from "./Login";

export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const url = new URL(window.location.href);
    const code = url.searchParams.get("code");

    if (!code) {
      console.error("No code found in URL");
      return;
    }

    // Exchange the code for an access token via backend
    fetch(`${import.meta.env.VITE_APP_BACKEND_URL}/auth/github`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ code }),
    })
      .then(async (res) => {
        const { access_token } = await res.json();

        if (!access_token) throw new Error("Missing access token");

        // Fetch user info
        const userRes = await fetch("https://api.github.com/user", {
          headers: {
            Authorization: `token ${access_token}`,
          },
        });
        const userData = await userRes.json();

        // Save token and user info
        sessionStorage.setItem("github_token", access_token);
        sessionStorage.setItem("github_username", userData.login);
        navigate("/repos");
      })
      .catch((err) => {
        console.error("OAuth exchange failed", err);
      });
  }, []);

  return (
    <>
      <Login showMessage="Authenticating with GitHub..."></Login>
    </>
  );
}
