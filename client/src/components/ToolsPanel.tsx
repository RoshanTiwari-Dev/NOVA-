import { useState } from "react";
import { FileText, Folder, Search, Code, Plus, ChevronDown, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Project {
  id: string;
  name: string;
  description: string;
}

interface Document {
  id: string;
  name: string;
  size: string;
}

interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export function ToolsPanel() {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set());
  const [projects, setProjects] = useState<Project[]>([
    { id: "1", name: "Sample Project", description: "Example project" },
  ]);
  const [documents, setDocuments] = useState<Document[]>([
    { id: "1", name: "sample.pdf", size: "2.5 MB" },
  ]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const toggleTool = (toolId: string) => {
    const newExpanded = new Set(expandedTools);
    if (newExpanded.has(toolId)) {
      newExpanded.delete(toolId);
    } else {
      newExpanded.add(toolId);
    }
    setExpandedTools(newExpanded);
  };

  // Projects Tool
  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName,
      description: newProjectDesc,
    };
    setProjects([...projects, newProject]);
    setNewProjectName("");
    setNewProjectDesc("");
    toast.success("Project created successfully");
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter((p) => p.id !== id));
    toast.success("Project deleted");
  };

  // Documents Tool
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const newDoc: Document = {
          id: Date.now().toString() + Math.random(),
          name: file.name,
          size: (file.size / 1024 / 1024).toFixed(2) + " MB",
        };
        setDocuments([...documents, newDoc]);
      });
      toast.success("Files uploaded successfully");
    }
  };

  const handleDeleteDocument = (id: string) => {
    setDocuments(documents.filter((d) => d.id !== id));
    toast.success("Document deleted");
  };

  // Web Search Tool
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search query");
      return;
    }

    try {
      const response = await fetch(
        `https://api.duckduckgo.com/?q=${encodeURIComponent(searchQuery)}&format=json`
      );
      const data = await response.json();

      const results: SearchResult[] = (data.Results || [])
        .slice(0, 5)
        .map((result: any) => ({
          title: result.Title,
          url: result.FirstURL,
          snippet: result.Text,
        }));

      setSearchResults(results);
      if (results.length === 0) {
        toast.info("No results found");
      } else {
        toast.success(`Found ${results.length} results`);
      }
    } catch (error) {
      toast.error("Search failed");
      console.error(error);
    }
  };

  // Code Interpreter Tool
  const handleExecuteCode = () => {
    if (!codeInput.trim()) {
      toast.error("Enter code to execute");
      return;
    }

    try {
      // Simple JavaScript execution (for demo)
      const result = eval(codeInput);
      setCodeOutput(String(result));
      toast.success("Code executed successfully");
    } catch (error) {
      setCodeOutput(`Error: ${(error as Error).message}`);
      toast.error("Code execution failed");
    }
  };

  return (
    <div className="w-full space-y-2">
      {/* Projects Tool */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleTool("projects")}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-blue-600" />
            <span className="font-medium text-sm">Projects</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("projects") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("projects") && (
          <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <input
                type="text"
                placeholder="Description"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <Button
                onClick={handleAddProject}
                className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-8"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Project
              </Button>
            </div>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs"
                >
                  <div>
                    <p className="font-medium">{project.name}</p>
                    <p className="text-gray-500">{project.description}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Documents Tool */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleTool("documents")}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            <span className="font-medium text-sm">Documents</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("documents") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("documents") && (
          <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50">
            <label className="block">
              <span className="text-xs font-medium text-gray-700 mb-1 block">
                Upload Files
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full text-xs"
              />
            </label>
            <div className="space-y-1 max-h-32 overflow-y-auto">
              {documents.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-xs"
                >
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-gray-500">{doc.size}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-3 h-3 text-red-600" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Web Search Tool */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleTool("search")}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-green-600" />
            <span className="font-medium text-sm">Web Search</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("search") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("search") && (
          <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
              />
              <Button
                onClick={handleSearch}
                className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 h-8"
              >
                <Search className="w-3 h-3" />
              </Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <a
                  key={idx}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-white border border-gray-200 rounded text-xs hover:bg-blue-50"
                >
                  <p className="font-medium text-blue-600 truncate">
                    {result.title}
                  </p>
                  <p className="text-gray-600 line-clamp-2">{result.snippet}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Interpreter Tool */}
      <div className="bg-white rounded-lg border border-gray-200">
        <button
          onClick={() => toggleTool("code")}
          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-orange-600" />
            <span className="font-medium text-sm">Code</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("code") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("code") && (
          <div className="border-t border-gray-200 p-3 space-y-2 bg-gray-50">
            <textarea
              placeholder="Enter JavaScript code..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-gray-300 rounded font-mono h-20"
            />
            <Button
              onClick={handleExecuteCode}
              className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1 h-8"
            >
              <Code className="w-3 h-3 mr-1" /> Execute
            </Button>
            {codeOutput && (
              <div className="p-2 bg-white border border-gray-300 rounded text-xs font-mono max-h-20 overflow-y-auto">
                <p className="text-gray-700">{codeOutput}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
