import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Repos from "./pages/Repos";
import RepoView from "./pages/RepoView";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/repos" element={<Repos />} />
          <Route path="/repos/:owner/:repo" element={<RepoView />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
