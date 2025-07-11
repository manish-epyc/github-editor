import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";

export default function Repos() {
  const token = sessionStorage.getItem("github_token");
  const navigate = useNavigate();
  const [manualRepo, setManualRepo] = useState("");

  const fetchRepos = async () => {
    const res = await fetch("https://api.github.com/user/repos?type=owner&sort=updated", {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch repos");
    const allRepos = await res.json();
    
    return allRepos.filter((repo: any) => !repo.private);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
    enabled: !!token,
  });

  const handleManualOpen = () => {
    if (!manualRepo.trim()) return;
    
    let owner = "";
    let repo = "";
    
    if (manualRepo.includes("github.com/")) {
      const match = manualRepo.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (match) {
        owner = match[1];
        repo = match[2];
      }
    } else if (manualRepo.includes("/")) {
      const parts = manualRepo.split("/");
      if (parts.length >= 2) {
        owner = parts[0];
        repo = parts[1];
      }
    }
    
    if (owner && repo) {
      navigate(`/repos/${owner}/${repo}`);
    } else {
      alert("Please enter a valid repository format (e.g., 'owner/repo' or GitHub URL)");
    }
  };

  if (!token) {
    navigate("/");
    return null;
  }

  return (
    <Layout>
      <div className="py-8 px-4 space-y-6 max-w-7xl mx-auto w-full font-sans">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Your Public Repositories</h1>
          <div className="text-sm text-gray-600">
            📝 Only markdown files (.md) can be edited • 🌐 Public repos only
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <h3 className="font-medium mb-3">Open Any Repository</h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. vercel/next.js or github.com/facebook/react"
              value={manualRepo}
              onChange={(e) => setManualRepo(e.target.value)}
              className="border border-gray-300 p-2 rounded-md flex-1"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleManualOpen();
                }
              }}
            />
            <button
              onClick={handleManualOpen}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Open
            </button>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p>Loading your repositories...</p>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-800 font-semibold mb-2">Error Loading Repositories</h3>
            <p className="text-red-700">Failed to load your repositories. Please try refreshing the page.</p>
          </div>
        )}

        {data && (
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Your Public Repositories ({data.length})
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.map((repo: any) => (
                <div
                  key={repo.id}
                  className="p-6 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-shadow"
                  onClick={() =>
                    navigate(`/repos/${repo.owner.login}/${repo.name}`)
                  }
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-lg font-semibold text-gray-900 break-words">
                      {repo.name}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      {repo.private ? "🔒" : "🌐"}
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {repo.description || "No description available"}
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {repo.language && (
                      <span className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        {repo.language}
                      </span>
                    )}
                    <span>⭐ {repo.stargazers_count}</span>
                    <span>🍴 {repo.forks_count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}