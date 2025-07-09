const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.post("/auth/github", async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: "Missing OAuth code" });
  }

  try {
    const tokenRes = await axios.post(
      "https://github.com/login/oauth/access_token",
      {
        client_id: process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code,
      },
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    const { access_token, error } = tokenRes.data;

    if (error || !access_token) {
      return res.status(400).json({ error: "Failed to get access token" });
    }

    res.json({ access_token });
  } catch (err) {
    console.error("Token exchange error:", err.message);
    res.status(500).json({ error: "GitHub token exchange failed" });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Auth server running on port ${PORT}`);
});
