import { useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { useState } from "react";

interface FileViewerProps {
  owner: string;
  repo: string;
  path: string;
  token: string | null;
  canEdit: boolean;
  isPublic?: boolean;
}

interface GitHubFileResponse {
  name: string;
  path: string;
  sha: string;
  content: string;
  encoding: string;
}

export default function FileViewer({
  owner,
  repo,
  path,
  token,
  canEdit,
  isPublic = false,
}: FileViewerProps) {
  const [value, setValue] = useState("");
  const [sha, setSha] = useState("");
  const [saving, setSaving] = useState(false);

  // Check if file is markdown
  const isMarkdownFile = path.endsWith(".md") || path.endsWith(".markdown");

  const fetchFile = async (): Promise<{ name: string }> => {
    const headers: Record<string, string> = {};
    if (token) {
      headers.Authorization = `token ${token}`;
    }

    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      { headers }
    );

    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("File not found");
      }
      if (res.status === 403) {
        throw new Error("Access denied - file may be in a private repository");
      }
      throw new Error("Failed to fetch file");
    }

    const data: GitHubFileResponse = await res.json();

    setValue(atob(data.content));
    setSha(data.sha);
    return { name: data.name };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["file", owner, repo, path, isPublic],
    queryFn: fetchFile,
  });

  const handleSave = async () => {
    if (!token || !canEdit) return;

    setSaving(true);
    try {
      const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
        {
          method: "PUT",
          headers: {
            Authorization: `token ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: `Updated ${path} via EPYC editor`,
            content: btoa(value),
            sha,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to save file");
      }

      const updatedFile = await response.json();
      setSha(updatedFile.content.sha);
      alert("File saved successfully to GitHub!");
    } catch (error) {
      console.error("Save failed:", error);
      alert("Failed to save file. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-semibold mb-2">Error Loading File</h3>
        <p className="text-red-700">{error.message}</p>
      </div>
    );
  }

  // Get file extension for syntax highlighting
  const getLanguageFromPath = (filePath: string): string => {
    const extension = filePath.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'js': case 'jsx': return 'javascript';
      case 'ts': case 'tsx': return 'typescript';
      case 'py': return 'python';
      case 'java': return 'java';
      case 'cpp': case 'cc': case 'cxx': return 'cpp';
      case 'c': return 'c';
      case 'cs': return 'csharp';
      case 'php': return 'php';
      case 'rb': return 'ruby';
      case 'go': return 'go';
      case 'rs': return 'rust';
      case 'sh': case 'bash': return 'shell';
      case 'sql': return 'sql';
      case 'html': case 'htm': return 'html';
      case 'css': return 'css';
      case 'scss': case 'sass': return 'scss';
      case 'json': return 'json';
      case 'xml': return 'xml';
      case 'yml': case 'yaml': return 'yaml';
      case 'md': case 'markdown': return 'markdown';
      case 'txt': return 'plaintext';
      default: return 'plaintext';
    }
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{data?.name}</h2>
          <p className="text-sm text-gray-600">
            {isPublic ? "Public Repository" : "Your Repository"} • 
            {isMarkdownFile ? (canEdit ? " Editable" : " Read-only") : " View-only"}
          </p>
        </div>
        
        {canEdit && isMarkdownFile && (
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            {saving ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </div>
            ) : (
              "Save to GitHub"
            )}
          </button>
        )}
      </div>

      {!isMarkdownFile && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-blue-800 text-sm">
            📖 This file is view-only. Only markdown files (.md, .markdown) can be edited.
          </p>
        </div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <Editor
          height="70vh"
          defaultLanguage={getLanguageFromPath(path)}
          value={value}
          onChange={(val) => setValue(val || "")}
          theme="light"
          options={{
            readOnly: !canEdit || !isMarkdownFile,
            minimap: { enabled: false },
            wordWrap: "on",
            lineNumbers: "on",
            folding: true,
            fontSize: 14,
            tabSize: 2,
            insertSpaces: true,
            automaticLayout: true,
          }}
        />
      </div>

      {!canEdit && !isPublic && isMarkdownFile && (
        <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800 text-sm">
            💡 You don't have write permissions to this repository. 
            The file is in read-only mode.
          </p>
        </div>
      )}

      {isPublic && isMarkdownFile && (
        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
          <p className="text-gray-700 text-sm">
            📖 This is a public repository. Login with GitHub to edit your own repositories.
          </p>
        </div>
      )}
    </div>
  );
}