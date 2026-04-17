import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Folder, FileText, Search, Code2, Plus, X } from "lucide-react";
import { toast } from "sonner";

export function ToolsUI() {
  const [activeTab, setActiveTab] = useState<"projects" | "documents" | "search" | "code">("projects");
  const [newProjectName, setNewProjectName] = useState("");
  const [newDocName, setNewDocName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [codeInput, setCodeInput] = useState("");

  // Projects
  const { data: projects } = trpc.tools.listProjects.useQuery();
  const createProjectMutation = trpc.tools.createProject.useMutation();

  // Documents
  const { data: documents } = trpc.tools.listDocuments.useQuery();
  const uploadDocMutation = trpc.tools.uploadDocument.useMutation();

  // Web Search
  const searchWebMutation = trpc.tools.searchWeb.useMutation();
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // Code Interpreter
  const executeCodeMutation = trpc.tools.executeCode.useMutation();
  const [codeOutput, setCodeOutput] = useState("");

  const handleCreateProject = async () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    try {
      await createProjectMutation.mutateAsync({ name: newProjectName });
      setNewProjectName("");
      toast.success("Project created successfully");
    } catch (error) {
      toast.error("Failed to create project");
    }
  };

  const handleUploadDocument = async () => {
    if (!newDocName.trim()) {
      toast.error("Document name is required");
      return;
    }
    try {
      await uploadDocMutation.mutateAsync({ filename: newDocName, content: "Sample content" });
      setNewDocName("");
      toast.success("Document uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload document");
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Search query is required");
      return;
    }
    try {
      const results = await searchWebMutation.mutateAsync({ query: searchQuery });
      setSearchResults(results);
      toast.success("Search completed");
    } catch (error) {
      toast.error("Search failed");
    }
  };

  const handleExecuteCode = async () => {
    if (!codeInput.trim()) {
      toast.error("Code is required");
      return;
    }
    try {
      const result = await executeCodeMutation.mutateAsync({
        code: codeInput,
        language: "python",
      });
      setCodeOutput(result.output || "Execution completed");
      toast.success("Code executed successfully");
    } catch (error) {
      toast.error("Code execution failed");
    }
  };

  return (
    <div className="w-full h-full bg-white rounded-lg border border-gray-200">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("projects")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "projects"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Folder className="w-4 h-4 inline mr-2" />
          Projects
        </button>
        <button
          onClick={() => setActiveTab("documents")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "documents"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Documents
        </button>
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "search"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Search className="w-4 h-4 inline mr-2" />
          Search
        </button>
        <button
          onClick={() => setActiveTab("code")}
          className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === "code"
              ? "border-b-2 border-green-500 text-green-600"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Code2 className="w-4 h-4 inline mr-2" />
          Code
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Projects Tab */}
        {activeTab === "projects" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="New project name..."
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={handleCreateProject}
                disabled={createProjectMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {projects?.map((project: any) => (
                <Card key={project.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === "documents" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Document name..."
                value={newDocName}
                onChange={(e) => setNewDocName(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={handleUploadDocument}
                disabled={uploadDocMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {documents?.map((doc: any) => (
                <Card key={doc.id} className="p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{doc.filename}</p>
                      <p className="text-xs text-gray-500">{(doc.size / 1024).toFixed(2)} KB</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Search Tab */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search the web..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
              />
              <Button
                onClick={handleSearch}
                disabled={searchWebMutation.isPending}
                className="bg-green-500 hover:bg-green-600 text-white"
                size="sm"
              >
                <Search className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((result: any, idx: number) => (
                <Card key={idx} className="p-3">
                  <p className="font-medium text-sm">{result.title}</p>
                  <p className="text-xs text-gray-600">{result.snippet}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Code Tab */}
        {activeTab === "code" && (
          <div className="space-y-4">
            <textarea
              placeholder="Enter Python code..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            <Button
              onClick={handleExecuteCode}
              disabled={executeCodeMutation.isPending}
              className="w-full bg-green-500 hover:bg-green-600 text-white"
            >
              Execute Code
            </Button>
            {codeOutput && (
              <Card className="p-3 bg-gray-50">
                <p className="text-xs font-mono text-gray-700">{codeOutput}</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
