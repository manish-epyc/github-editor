import { Link, useParams, useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FileViewer from "../components/FileViewer";
import Layout from "../components/Layout";
import FileTreeSidebar from "../components/FileTreeSidebar";
import LEFT_ARROW from "../assets/left-arrow.svg";
import type { TreeNode } from "../types/tree";

export default function PublicRepoView() {
  const { owner, repo } = useParams();
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const fromUserRepos = location.state?.fromUserRepos;

  const handleBackNavigation = () => {
    if (fromUserRepos) {
      navigate(`/user/${owner}`);
    } else {
      navigate("/");
    }
  };

  const fetchRepoMeta = async () => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`);
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error(
          "Repository not found. Please check the repository name and make sure it's public."
        );
      }
      throw new Error("Failed to fetch repository information");
    }
    return res.json();
  };

  const {
    data: repoMeta,
    isLoading: repoLoading,
    error: repoError,
  } = useQuery({
    queryKey: ["publicRepoMeta", owner, repo],
    queryFn: fetchRepoMeta,
  });

  const fetchFileTree = async () => {
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoMeta.default_branch}?recursive=true`
    );
    if (!branchRes.ok) throw new Error("Failed to fetch file tree");
    const data = await branchRes.json();
    return data;
  };

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ["publicFileTree", owner, repo],
    queryFn: fetchFileTree,
    enabled: !!repoMeta?.default_branch,
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

  const markdownCount = allFiles.filter(
    (file) => file.path.endsWith(".md") || file.path.endsWith(".markdown")
  ).length;

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-red-800 mb-2">
              Repository Not Found
            </h2>
            <p className="text-red-700 mb-4">
              {repoError.message ||
                "The repository you're looking for doesn't exist or is private."}
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Back Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen font-sans">
      <Layout>
        <div className="w-1/3 max-w-80 p-4 overflow-y-auto border border-gray-300 border-t-0 font-sans">
          <div
            onClick={handleBackNavigation}
            className="flex items-center gap-4 mb-8 text-lg cursor-pointer hover:text-blue-600"
          >
            <img src={LEFT_ARROW} className="w-5 h-5" alt="Back" />
            {fromUserRepos ? `Back to Repositories` : "Back to Home"}
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-semibold mb-1">{repoMeta?.name}</h2>
            <p className="text-sm text-gray-600 mb-2">
              by {repoMeta?.owner?.login}
            </p>
            {repoMeta?.description && (
              <p className="text-sm text-gray-500 mb-4">
                {repoMeta.description}
              </p>
            )}
          </div>

          <h3 className="text-md font-medium mb-2 text-gray-700">
            Files ({allFiles.length}) • {markdownCount} editable
          </h3>

          {treeLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Loading files...</span>
            </div>
          ) : allFiles.length === 0 ? (
            <p className="text-gray-500 text-sm">
              No files found in this repository.
            </p>
          ) : (
            <FileTreeSidebar
              files={allFiles}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          )}
        </div>

        <div className="flex-1 p-8 font-sans">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">{repoMeta?.name}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <span>⭐ {repoMeta?.stargazers_count || 0} stars</span>
              <span>🍴 {repoMeta?.forks_count || 0} forks</span>
              <span>📝 {markdownCount} editable files</span>
            </div>
          </div>

          {selectedFile ? (
            <FileViewer
              owner={owner!}
              repo={repo!}
              path={selectedFile}
              token={null}
              canEdit={false}
              isPublic={true}
            />
          ) : (
            <div className="text-center py-12 font-sans">
              <div className="bg-gray-50 rounded-lg p-8 max-w-md mx-auto">
                <h3 className="text-lg font-medium mb-2">Select a File</h3>
                <p className="text-gray-600 mb-4">
                  Choose any file from the sidebar to view its contents.
                  Markdown files (.md) can be edited.
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
