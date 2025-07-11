# ✅ EPYC GitHub Repo Editor — Core TODOs

## 🧩 1. Core Frontend Tech Stack

- [ ] Set up **React** with **TypeScript**
- [ ] Use **Vite** for fast development and build
- [ ] Install and configure **Tailwind CSS** for styling
- [ ] Set up **React Router** for route-based navigation
- [ ] Use **React Query** (`@tanstack/react-query`) for all API interactions
- [ ] Integrate **Monaco Editor** for file editing experience
- [ ] Use **shadcn/ui** for pre-built UI components (inputs, modals, etc.)

---

## 🔐 2. Authentication (Minimal Backend)

- [ ] Implement **GitHub OAuth** (client-side redirect flow)
- [ ] On redirect callback, extract `code` from URL
- [ ] Send `code` to **Express.js backend** for token exchange
- [ ] Backend exchanges code with GitHub using `client_id` + `client_secret`
- [ ] Return `access_token` to frontend
- [ ] Store token in **sessionStorage** (no long-term storage)

---

## 📁 3. Repository Listing & URL Access

- [ ] Use token to fetch authenticated user's repos:
  - `GET /user/repos`
- [ ] Display list of repos with clickable UI
- [ ] Provide input field for arbitrary repo URL (e.g. `vercel/next.js`)
- [ ] If repo is manually entered, check permission:
  - `GET /repos/:owner/:repo/collaborators/:username/permission`
- [ ] If user does **not** have write access → open in **view-only mode**

---

## 🗂️ 4. Repo File Browser

- [ ] Fetch file structure using:
  - `GET /repos/:owner/:repo/git/trees/:sha?recursive=true`
- [ ] Render a collapsible sidebar showing folders and files
- [ ] Add icons based on file types (optional)

---

## 📝 5. File Viewer / Editor

- [ ] Fetch file content using:
  - `GET /repos/:owner/:repo/contents/:path`
- [ ] Render file in Monaco Editor with:
  - Syntax highlighting
  - Dirty-state tracking
- [ ] Disable editing when in view-only mode
- [ ] Add Save button (manual commit)

---

## 🔄 6. GitHub File Sync (Save Updates)

- [ ] On Save:
  - Fetch latest file SHA
  - Encode new content to base64
  - Send `PUT /repos/:owner/:repo/contents/:path` with commit message
- [ ] Optionally debounce autosaves (future)

---

## 🧠 7. Access Mode Logic

- [ ] Enable **Edit Mode** only if:
  - Authenticated user has write access to the repo
- [ ] Fall back to **View Mode** otherwise
- [ ] Hide or disable editing and saving UI in view mode





# 🔐 EPYC GitHub Auth Backend — TODOs

## 🧩 1. Setup Basic Express Server

- [ ] Initialize a Node.js project with `npm init -y`
- [ ] Install required packages:
  - `express`
  - `axios`
  - `cors`
  - `dotenv`

---

## 🛠️ 2. Create Token Exchange Endpoint

- [ ] Create an Express server in `index.js`
- [ ] Enable `CORS` and JSON parsing middleware
- [ ] Load `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` from `.env`
- [ ] Create a POST route: `/auth/github`
- [ ] Accept `code` from frontend as request body
- [ ] Send request to GitHub:
  - URL: `https://github.com/login/oauth/access_token`
  - Method: `POST`
  - Body:
    - `client_id`
    - `client_secret`
    - `code`
  - Headers: `Accept: application/json`
- [ ] Return GitHub `access_token` as JSON response to frontend

---

## 🔐 3. Environment Variables (`.env`)

- [ ] Create `.env` file with:


# Testing
# Testing
# Testing