import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import FileViewer from "../components/FileViewer";
import Layout from "../components/Layout";
import FileTreeSidebar from "../components/FileTreeSidebar";
import LEFT_ARROW from "../assets/left-arrow.svg";

export default function RepoView() {
  const { owner, repo } = useParams();
  const token = sessionStorage.getItem("github_token");
  const username = sessionStorage.getItem("github_username");
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const fetchRepoMeta = async () => {
    const res = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        Authorization: `token ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed to fetch repo meta");
    return res.json();
  };

  const { data: repoMeta, isLoading: metaLoading } = useQuery({
    queryKey: ["repoMeta", owner, repo],
    queryFn: fetchRepoMeta,
    enabled: !!token,
  });

  const treeSha = repoMeta?.default_branch
    ? repoMeta?.["default_branch"]
    : undefined;

  const fetchFileTree = async () => {
    const branchRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/git/trees/${repoMeta.default_branch}?recursive=true`,
      {
        headers: {
          Authorization: `token ${token}`,
        },
      }
    );
    if (!branchRes.ok) throw new Error("Failed to fetch tree");
    return branchRes.json();
  };

  const { data: treeData, isLoading: treeLoading } = useQuery({
    queryKey: ["fileTree", owner, repo],
    queryFn: fetchFileTree,
    enabled: !!treeSha,
  });

  const files =
    treeData?.tree?.filter((item: any) => item.type === "blob") || [];

  const { data: permissionData, isLoading: permissionLoading } = useQuery({
    queryKey: ["permission", owner, repo],
    queryFn: async () => {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/collaborators/${username}/permission`,
        {
          headers: { Authorization: `token ${token}` },
        }
      );
      return res.json();
    },
    enabled: !!username,
  });

  const canEdit =
    permissionData?.permission === "admin" ||
    permissionData?.permission === "write";

  function SidebarItem({
    node,
    onSelect,
  }: {
    node: TreeNode;
    onSelect: (path: string) => void;
  }) {
    const [open, setOpen] = useState(false);

    if (node.type === "tree") {
      return (
        <div>
          <div
            className="cursor-pointer font-medium text-gray-700 hover:text-black"
            onClick={() => setOpen(!open)}
          >
            {open ? "📂" : "📁"} {node.name}
          </div>
          {open && (
            <div className="ml-4">
              {node.children?.map((child) => (
                <SidebarItem
                  key={child.path}
                  node={child}
                  onSelect={onSelect}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <div
        className="cursor-pointer text-blue-600 hover:underline ml-4"
        onClick={() => onSelect(node.path)}
      >
        📄 {node.name}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      <Layout>
        {/* Sidebar: File Tree */}
        <div className="w-1/3 max-w-80 p-4 overflow-y-auto shadow-md bg-white ">
          <Link to="/repos">
            <div className="flex items-center gap-4 mb-8 text-lg cursor-pointer">
              <img src={LEFT_ARROW} className="w-5 h-5" /> All Repositories
            </div>
          </Link>
          <h2 className="text-lg font-semibold mb-2">Files</h2>
          {treeLoading ? (
            <p>Loading file tree...</p>
          ) : (
            <FileTreeSidebar
              files={files}
              selectedFile={selectedFile}
              setSelectedFile={setSelectedFile}
            />
          )}
        </div>

        {/* Main: Editor Area */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-semibold capitalize mb-6">
            {/* {owner}  */}
            {repo} Repository
          </h2>

          {selectedFile ? (
            <FileViewer
              owner={owner!}
              repo={repo!}
              path={selectedFile}
              token={token!}
              canEdit={canEdit}
            />
          ) : (
            <p className="text-gray-500">Select a file to view</p>
          )}
        </div>
      </Layout>
    </div>
  );
}
