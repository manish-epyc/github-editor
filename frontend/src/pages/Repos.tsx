import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router";
import Layout from "../components/Layout";

export default function Repos() {
  const token = sessionStorage.getItem("github_token");
  const navigate = useNavigate();
  const [manualRepo, setManualRepo] = useState("");

  const fetchRepos = async () => {
    const res = await fetch("https://api.github.com/user/repos", {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch repos");
    return res.json();
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["repos"],
    queryFn: fetchRepos,
    enabled: !!token,
  });

  const handleManualOpen = () => {
    if (!manualRepo.includes("/")) return;
    navigate(`/repos/${manualRepo}`);
  };

  return (
    <Layout>
      <div className="py-8 space-y-6">
        <h1 className="text-2xl font-bold">Your Repositories</h1>

        <div className="flex gap-2">
          <input
            type="text"
            placeholder="e.g. vercel/next.js"
            value={manualRepo}
            onChange={(e) => setManualRepo(e.target.value)}
            className="border p-2 rounded-md w-80"
          />
          <button
            onClick={handleManualOpen}
            className="bg-black text-white px-4 py-2 rounded-md"
          >
            Open
          </button>
        </div>

        {isLoading && <p>Loading...</p>}
        {error && <p className="text-red-500">Error loading repos</p>}

        <ul className="grid sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
          {data?.map((repo: any) => (
            <li
              key={repo.id}
              className="p-6 bg-white border rounded-lg shadow-md cursor-pointer border-gray-200"
              onClick={() =>
                navigate(`/repos/${repo.owner.login}/${repo.name}`)
              }
            >
              <div className="text-lg font-semibold mb-4 leading-normal">{repo.full_name}</div>
              <div className="text-sm text-gray-500">
                {repo.description || "No description"}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}
