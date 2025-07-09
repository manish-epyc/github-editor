import { useState, useMemo } from "react";
import { ChevronRight, ChevronDown, Folder, File } from "lucide-react";

type TreeNode = {
  name: string;
  path: string;
  type: "file" | "folder";
  children?: TreeNode[];
};

interface FileTreeSidebarProps {
  files: TreeNode[];
  selectedFile: string | null;
  setSelectedFile: (path: string) => void;
}

function FileTreeSidebar({ files, selectedFile, setSelectedFile }: FileTreeSidebarProps) {
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set([""]));

  // Build hierarchical tree structure from flat file list
  const fileTree = useMemo<TreeNode[]>(() => {
    const root: TreeNode = { name: "", path: "", type: "folder", children: [] };

    files.forEach((file) => {
      const filePath = typeof file === "string" ? file : file.path;
      const pathParts = filePath.split("/");
      let currentNode = root;

      // Navigate/create folder structure
      for (let i = 0; i < pathParts.length - 1; i++) {
        const folderName = pathParts[i];
        const folderPath = pathParts.slice(0, i + 1).join("/");

        let folderNode = currentNode.children?.find(
          (child) => child.name === folderName && child.type === "folder"
        );

        if (!folderNode) {
          folderNode = {
            name: folderName,
            path: folderPath,
            type: "folder",
            children: [],
          };
          currentNode.children!.push(folderNode);
        }

        currentNode = folderNode;
      }

      // Add the file
      const fileName = pathParts[pathParts.length - 1];
      currentNode.children!.push({
        name: fileName,
        path: filePath,
        type: "file",
      });
    });

    // Sort children: folders first, then files, both alphabetically
    const sortChildren = (node: TreeNode) => {
      if (node.children) {
        node.children.sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === "folder" ? -1 : 1;
          }
          return a.name.localeCompare(b.name);
        });
        node.children.forEach(sortChildren);
      }
    };

    sortChildren(root);
    return root.children || [];
  }, [files]);

  const toggleFolder = (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const renderNode = (node: TreeNode, level = 0): JSX.Element => {
    const isFolder = node.type === "folder";
    const isExpanded = expandedFolders.has(node.path);
    const isSelected = selectedFile === node.path;

    if (isFolder) {
      return (
        <li key={node.path} className="list-none">
          <div
            className={`flex items-center py-1 cursor-pointer hover:bg-gray-100 rounded text-base ${
              isSelected ? "bg-blue-50" : ""
            }`}
            style={{ paddingLeft: `${level * 16}px` }}
            onClick={() => toggleFolder(node.path)}
          >
            {isExpanded ? (
              <ChevronDown
                size={14}
                className="mr-1 text-gray-500 flex-shrink-0"
              />
            ) : (
              <ChevronRight
                size={14}
                className="mr-1 text-gray-500 flex-shrink-0"
              />
            )}
            <Folder size={14} className="mr-2 text-blue-500 flex-shrink-0" />
            <span className="text-gray-800 font-medium truncate">
              {node.name}
            </span>
          </div>

          {isExpanded && node.children && (
            <ul className="space-y-1 ml-0">
              {node.children.map((child) => renderNode(child, level + 1))}
            </ul>
          )}
        </li>
      );
    }

    // File node
    return (
      <li
        key={node.path}
        className={`list-none cursor-pointer text-blue-600 hover:underline flex items-center py-1 text-base ${
          isSelected ? "bg-blue-50 font-medium" : ""
        }`}
        style={{ paddingLeft: `${level * 16 + 16}px` }}
        onClick={() => setSelectedFile(node.path)}
      >
        <File size={14} className="mr-2 text-gray-500 flex-shrink-0" />
        <span className="truncate">{node.name}</span>
      </li>
    );
  };

  if (!files || files.length === 0) {
    return (
      <ul className="space-y-1">
        <li className="text-gray-500 text-sm">No files found</li>
      </ul>
    );
  }

  return (
    <ul className="space-y-1">{fileTree.map((node) => renderNode(node))}</ul>
  );
}

export default FileTreeSidebar;
