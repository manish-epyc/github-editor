import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FileViewer from "../components/FileViewer";
import Layout from "../components/Layout";
import FileTreeSidebar from "../components/FileTreeSidebar";
import LEFT_ARROW from "../assets/left-arrow.svg";
import type { TreeNode } from "../types/tree";

export default function RepoView() {
  const { owner, repo } = useParams();
  const token = sessionStorage.getItem("github_token");
  const username = sessionStorage.getItem("github_username");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const fetchRepoMeta = async () => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers,
    });
    if (!res.ok) throw new Error("Failed to fetch repo meta");
    return res.json();
  };

  const { data: repoMeta, isLoading: repoLoading, error: repoError } = useQuery({
    queryKey: ["repoMeta", owner, repo],
    queryFn: fetchRepoMeta,
  });

  const treeSha = repoMeta?.default_branch;

  const fetchFileTree = async () => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoMeta.default_branch}?recursive=true`,
      { headers }
    );
    if (!branchRes.ok) throw new Error("Failed to fetch tree");
    return branchRes.json();
  };

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ["fileTree", owner, repo],
    queryFn: fetchFileTree,
    enabled: !!treeSha,
  });

  
  const allFiles: TreeNode[] =
    treeData?.tree
      ?.filter((item: any) => item.type === "blob")
      .map((item: any) => ({
        name: item.path.split("/").pop() || "",
        path: item.path,
        type: item.type,
        children: [],
      })) || [];

      
  const markdownCount = allFiles.filter(file => 
    file.path.endsWith(".md") || file.path.endsWith(".markdown")
  ).length;

  const { data: permissionData } = useQuery({
    queryKey: ["permission", owner, repo],
    queryFn: async () => {
      if (!token || !username) return null;
      
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}/permission`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      if (!res.ok) return null;
      return res.json();
    },
    enabled: !!username && !!token,
  });

  const canEdit = token && (
    permissionData?.permission === "admin" ||
    permissionData?.permission === "write" ||
    username === owner // Owner can always edit their own repos
  );

  if (repoLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading repository...</p>
        </div>
      </div>
    );
  }

  if (repoError) {
    return (
      <div className="flex items-center justify-center min-h-screen font-sans">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">Repository Error</h2>
            <p className="text-red-700 mb-4">
              Failed to load repository. It may be private or doesn't exist.
            </p>
            <Link 
              to="/repos" 
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Repositories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Layout>
        {/* Sidebar: File Tree */}
        <div className="w-1/3 max-w-80 p-4 overflow-y-auto border border-gray-300 border-t-0 font-sans">
          <Link to="/repos">
            <div className="flex items-center gap-4 mb-8 text-lg cursor-pointer hover:text-blue-600 font-sans">
              <img src={LEFT_ARROW} className="w-5 h-5" alt="Back" /> 
              All Repositories
            </div>
          </Link>
          
          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">{repo}</h2>
            <p className="text-sm text-gray-600 mb-2">by {owner}</p>
            {repoMeta?.description && (
              <p className="text-sm text-gray-500 mb-4">{repoMeta.description}</p>
            )}
          </div>

          <h3 className="text-md font-medium mb-2 text-gray-700 font-sans">
            Files ({allFiles.length}) • {markdownCount} editable
          </h3>
          
          {treeLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading files...</span>
            </div>
          ) : allFiles.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-yellow-700 text-sm">
                No files found in this repository.
              </p>
            </div>
          ) : (
            <FileTreeSidebar
              files={allFiles}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          )}
        </div>

        {/* Main: Editor Area */}
        <div className="flex-1 p-8 font-sans">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold capitalize mb-2">
              {repo} Repository
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
              <span>⭐ {repoMeta?.stargazers_count || 0} stars</span>
              <span>🍴 {repoMeta?.forks_count || 0} forks</span>
              <span>📝 {markdownCount} editable files</span>
              {canEdit && <span className="text-green-600">✏️ Editable</span>}
            </div>
            
            {!token && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <p className="text-blue-800 text-sm">
                  💡 You're viewing a public repository. 
                  <Link to="/" className="text-blue-600 hover:underline ml-1">
                    Login with GitHub
                  </Link> to edit your own repositories.
                </p>
              </div>
            )}
          </div>

          {selectedFile ? (
            <FileViewer
              owner={owner!}
              repo={repo!}
              path={selectedFile}
              token={token}
              canEdit={!!canEdit}
              isPublic={!token}
            />
          ) : (
            <div className="text-center py-12">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">Select a File</h3>
                <p className="text-gray-600 mb-4">
                  Choose any file from the sidebar to view its contents. Markdown files (.md) can be edited.
                </p>
                {allFiles.length === 0 && (
                  <p className="text-sm text-gray-500">
                    This repository doesn't contain any files.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </Layout>
    </div>
  );
}