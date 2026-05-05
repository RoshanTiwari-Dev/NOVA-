import { useState } from "react";
import { ChevronDown, Plus, Trash2, Upload, Search, Play, Loader } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

interface Document {
  id: string;
  filename: string;
  size: number;
  uploadedAt: Date;
  preview?: string;
}

interface CodeResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

export function ToolsManagerEnhanced() {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<Project[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [codeLanguage, setCodeLanguage] = useState("python");
  const [codeInput, setCodeInput] = useState("");
  const [codeResult, setCodeResult] = useState<CodeResult | null>(null);
  const [projectName, setProjectName] = useState("");
  const [projectDesc, setProjectDesc] = useState("");
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Loading states
  const [loadingStates, setLoadingStates] = useState({
    createProject: false,
    uploadDoc: false,
    search: false,
    executeCode: false,
  });

  const toggleTool = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  const setLoading = (key: keyof typeof loadingStates, value: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [key]: value }));
  };

  // Projects Tool
  const handleCreateProject = async () => {
    if (!projectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    setLoading("createProject", true);
    try {
      const newProject: Project = {
        id: Date.now().toString(),
        name: projectName,
        description: projectDesc,
        createdAt: new Date(),
      };
      setProjects([...projects, newProject]);
      setProjectName("");
      setProjectDesc("");
      toast.success(`Project "${projectName}" created successfully`);
    } catch (error) {
      toast.error("Failed to create project");
    } finally {
      setLoading("createProject", false);
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    toast.success("Project deleted");
  };

  // Documents Tool
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    setLoading("uploadDoc", true);
    try {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = event.target?.result as string;
          const newDoc: Document = {
            id: Date.now().toString() + Math.random(),
            filename: file.name,
            size: file.size,
            uploadedAt: new Date(),
            preview: file.type.startsWith("image/") ? preview : undefined,
          };
          setDocuments((prev) => [...prev, newDoc]);
        };
        if (file.type.startsWith("image/")) {
          reader.readAsDataURL(file);
        }
        toast.success(`File "${file.name}" uploaded successfully`);
      });
    } catch (error) {
      toast.error("Upload failed");
    } finally {
      setLoading("uploadDoc", false);
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
    toast.success("Document deleted");
  };

  // Web Search Tool
  const handleWebSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search query");
      return;
    }

    setLoading("search", true);
    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json&no_html=1&skip_disambig=1`
      );
      const data = await response.json() as any;
      const results = data.Results?.slice(0, 5).map((result: any) => ({
        title: result.Text,
        url: result.FirstURL,
        snippet: result.Text,
      })) || [];

      if (results.length === 0 && data.RelatedTopics) {
        setSearchResults(
          data.RelatedTopics.slice(0, 5).map((topic: any) => ({
            title: topic.Text?.split(" - ")[0] || "Related Topic",
            url: topic.FirstURL || "#",
            snippet: topic.Text || "Related search topic",
          }))
        );
      } else {
        setSearchResults(results);
      }
      toast.success("Search completed");
    } catch (error) {
      toast.error("Search failed");
      console.error(error);
    } finally {
      setLoading("search", false);
    }
  };

  // Code Interpreter Tool
  const handleExecuteCode = async () => {
    if (!codeInput.trim()) {
      toast.error("Enter code to execute");
      return;
    }

    setLoading("executeCode", true);
    try {
      const response = await fetch("https://emkc.org/api/v2/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          language: codeLanguage,
          source: codeInput,
        }),
      });
      const result = await response.json() as any;
      setCodeResult({
        stdout: result.run?.stdout || "",
        stderr: result.run?.stderr || "",
        exitCode: result.run?.exit_code || 0,
      });
      toast.success("Code executed successfully");
    } catch (error) {
      toast.error("Code execution failed");
      console.error(error);
    } finally {
      setLoading("executeCode", false);
    }
  };

  const tools = [
    {
      id: "projects",
      name: "Projects",
      icon: "📁",
      description: "Organize chats by project",
    },
    {
      id: "documents",
      name: "Documents",
      icon: "📄",
      description: "Upload and analyze files",
    },
    {
      id: "search",
      name: "Web Search",
      icon: "🔍",
      description: "Search the internet",
    },
    {
      id: "code",
      name: "Code Interpreter",
      icon: "💻",
      description: "Execute and debug code",
    },
  ];

  return (
    <div className="space-y-2">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-3">
        Tools & Features
      </div>
      {tools.map((tool) => {
        const isExpanded = expandedTools.has(tool.id);
        return (
          <div key={tool.id}>
            <button
              onClick={() => toggleTool(tool.id)}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors bg-gray-50 hover:bg-gray-100 text-gray-800"
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="text-sm font-medium flex-1 text-left">{tool.name}</span>
              <ChevronDown
                className={`w-4 h-4 flex-shrink-0 transition-transform ${
                  isExpanded ? "rotate-180" : ""
                }`}
              />
            </button>

            {isExpanded && (
              <div className="mt-2 ml-3 pl-3 border-l-2 border-green-300 py-2 space-y-2">
                {/* Projects Tool */}
                {tool.id === "projects" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">{tool.description}</p>
                    <div className="space-y-2">
                      <input
                        type="text"
                        placeholder="Project name"
                        value={projectName}
                        onChange={(e) => setProjectName(e.target.value)}
                        disabled={loadingStates.createProject}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                      <input
                        type="text"
                        placeholder="Description (optional)"
                        value={projectDesc}
                        onChange={(e) => setProjectDesc(e.target.value)}
                        disabled={loadingStates.createProject}
                        className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                      <Button
                        onClick={handleCreateProject}
                        disabled={loadingStates.createProject}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8 disabled:opacity-50"
                        size="sm"
                      >
                        {loadingStates.createProject ? (
                          <>
                            <Loader className="w-3 h-3 mr-1 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Create Project
                          </>
                        )}
                      </Button>
                    </div>
                    {projects.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-gray-700">Your Projects:</p>
                        {projects.map((proj) => (
                          <div
                            key={proj.id}
                            className="flex items-center justify-between bg-blue-50 p-2 rounded text-xs"
                          >
                            <div>
                              <p className="font-medium text-blue-900">{proj.name}</p>
                              {proj.description && (
                                <p className="text-blue-700">{proj.description}</p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDeleteProject(proj.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Documents Tool */}
                {tool.id === "documents" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">{tool.description}</p>
                    <label className="flex items-center gap-2 px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded cursor-pointer disabled:opacity-50">
                      {loadingStates.uploadDoc ? (
                        <>
                          <Loader className="w-3 h-3 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-3 h-3" />
                          Upload File
                        </>
                      )}
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        disabled={loadingStates.uploadDoc}
                        className="hidden"
                      />
                    </label>
                    {documents.length > 0 && (
                      <div className="mt-3 space-y-1">
                        <p className="text-xs font-semibold text-gray-700">Your Documents:</p>
                        {documents.map((doc) => (
                          <div key={doc.id}>
                            <div className="flex items-center justify-between bg-purple-50 p-2 rounded text-xs">
                              <div
                                className="flex-1 cursor-pointer hover:text-purple-700"
                                onClick={() =>
                                  setPreviewDoc(previewDoc?.id === doc.id ? null : doc)
                                }
                              >
                                <p className="font-medium text-purple-900">{doc.filename}</p>
                                <p className="text-purple-700">
                                  {(doc.size / 1024).toFixed(2)} KB
                                </p>
                              </div>
                              <button
                                onClick={() => handleDeleteDocument(doc.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                            {previewDoc?.id === doc.id && doc.preview && (
                              <div className="mt-2 bg-purple-100 p-2 rounded">
                                <img
                                  src={doc.preview}
                                  alt={doc.filename}
                                  className="w-full h-32 object-cover rounded"
                                />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Web Search Tool */}
                {tool.id === "search" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">{tool.description}</p>
                    <div className="flex gap-1">
                      <input
                        type="text"
                        placeholder="Search query..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleWebSearch()}
                        disabled={loadingStates.search}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                      />
                      <Button
                        onClick={handleWebSearch}
                        disabled={loadingStates.search}
                        className="bg-green-600 hover:bg-green-700 text-white text-xs h-8 px-2 disabled:opacity-50"
                        size="sm"
                      >
                        {loadingStates.search ? (
                          <Loader className="w-3 h-3 animate-spin" />
                        ) : (
                          <Search className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-semibold text-gray-700">Results:</p>
                        {searchResults.map((result, idx) => (
                          <a
                            key={idx}
                            href={result.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block bg-green-50 p-2 rounded text-xs hover:bg-green-100 transition-colors"
                          >
                            <p className="font-medium text-green-900 truncate">
                              {result.title}
                            </p>
                            <p className="text-green-700 text-xs truncate">{result.url}</p>
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Code Interpreter Tool */}
                {tool.id === "code" && (
                  <div className="space-y-2">
                    <p className="text-xs text-gray-600">{tool.description}</p>
                    <select
                      value={codeLanguage}
                      onChange={(e) => setCodeLanguage(e.target.value)}
                      disabled={loadingStates.executeCode}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100"
                    >
                      <option value="python">Python</option>
                      <option value="javascript">JavaScript</option>
                      <option value="java">Java</option>
                      <option value="cpp">C++</option>
                      <option value="csharp">C#</option>
                    </select>
                    <textarea
                      value={codeInput}
                      onChange={(e) => setCodeInput(e.target.value)}
                      placeholder="Enter your code here..."
                      disabled={loadingStates.executeCode}
                      className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500 font-mono disabled:bg-gray-100"
                      rows={4}
                    />
                    <Button
                      onClick={handleExecuteCode}
                      disabled={loadingStates.executeCode}
                      className="w-full bg-green-600 hover:bg-green-700 text-white text-xs h-8 disabled:opacity-50"
                      size="sm"
                    >
                      {loadingStates.executeCode ? (
                        <>
                          <Loader className="w-3 h-3 mr-1 animate-spin" />
                          Executing...
                        </>
                      ) : (
                        <>
                          <Play className="w-3 h-3 mr-1" />
                          Execute Code
                        </>
                      )}
                    </Button>
                    {codeResult && (
                      <div className="mt-3 space-y-2 bg-gray-900 text-gray-100 p-2 rounded font-mono text-xs">
                        {codeResult.stdout && (
                          <div>
                            <p className="text-green-400 font-semibold">Output:</p>
                            <p className="whitespace-pre-wrap break-words">
                              {codeResult.stdout}
                            </p>
                          </div>
                        )}
                        {codeResult.stderr && (
                          <div>
                            <p className="text-red-400 font-semibold">Error:</p>
                            <p className="whitespace-pre-wrap break-words">
                              {codeResult.stderr}
                            </p>
                          </div>
                        )}
                        {!codeResult.stdout && !codeResult.stderr && (
                          <p className="text-gray-400">Code executed successfully (no output)</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
