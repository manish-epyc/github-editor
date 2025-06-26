import { useQuery } from "@tanstack/react-query";
import Editor from "@monaco-editor/react";
import { useState } from "react";

export default function FileViewer({
  owner,
  repo,
  path,
  token,
  canEdit,
}: {
  owner: string;
  repo: string;
  path: string;
  token: string;
  canEdit: boolean;
}) {
  const [value, setValue] = useState("");
  const [sha, setSha] = useState("");
  const [saving, setSaving] = useState(false);
  const fetchFile = async () => {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        headers: { Authorization: `token ${token}` },
      }
    );
    const data = await res.json();
    console.log(data);
    
    setValue(atob(data.content));
    setSha(data.sha);
    return { name: data.name };
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["file", owner, repo, path],
    queryFn: fetchFile,
  });

  if (isLoading) return <p>Loading file...</p>;
  if (error) return <p>Error loading file</p>;

  return (
    <div>
      <h2 className="mb-2 font-semibold">{data?.name}</h2>
      <Editor
        height="75vh"
        defaultLanguage="javascript"
        value={value}
        onChange={(val) => setValue(val || "")}
        theme="vs-dark"
        options={{ readOnly: !canEdit }}
      />

      {canEdit && (
        <button
          onClick={async () => {
            setSaving(true);
            await fetch(
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
            setSaving(false);
            alert("File saved to GitHub.");
          }}
          className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-500"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save to GitHub"}
        </button>
      )}
    </div>
  );
}
