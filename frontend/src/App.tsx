import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Repos from "./pages/Repos";
import RepoView from "./pages/RepoView";
import PublicRepoView from "./pages/PublicRepoView";
import UserReposView from "./pages/UserReposView";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repos" element={<Repos />} />
          <Route path="/repos/:owner/:repo" element={<RepoView />} />
          <Route path="/user/:username" element={<UserReposView />} />
          <Route path="/public/:owner/:repo" element={<PublicRepoView />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
