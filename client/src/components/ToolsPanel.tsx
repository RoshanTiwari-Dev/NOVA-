import { useState } from "react";
import { FileText, Folder, Search, Code, Plus, ChevronDown, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

export function ToolsPanel() {
  const [expandedTools, setExpandedTools] = useState<Set<string>>(new Set(["projects"]));
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [codeInput, setCodeInput] = useState("");
  const [codeOutput, setCodeOutput] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDesc, setNewProjectDesc] = useState("");

  const utils = trpc.useUtils();

  // Queries
  const { data: projects, isLoading: projectsLoading } = trpc.tools.listProjects.useQuery();
  const { data: documents, isLoading: documentsLoading } = trpc.tools.listDocuments.useQuery();

  // Mutations
  const createProject = trpc.tools.createProject.useMutation({
    onSuccess: () => {
      utils.tools.listProjects.invalidate();
      setNewProjectName("");
      setNewProjectDesc("");
      toast.success("Project created successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteProject = trpc.tools.deleteProject.useMutation({
    onSuccess: () => {
      utils.tools.listProjects.invalidate();
      toast.success("Project deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const uploadDocument = trpc.tools.uploadDocument.useMutation({
    onSuccess: () => {
      utils.tools.listDocuments.invalidate();
      toast.success("File uploaded successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteDocument = trpc.tools.deleteDocument.useMutation({
    onSuccess: () => {
      utils.tools.listDocuments.invalidate();
      toast.success("Document deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const webSearch = trpc.tools.searchWeb.useQuery(
    { query: searchQuery },
    { enabled: false }
  );

  const executeCode = trpc.tools.executeCode.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        setCodeOutput(data.output || "Success (no output)");
        toast.success("Code executed");
      } else {
        setCodeOutput(`Error: ${data.error}`);
        toast.error("Execution failed");
      }
    },
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

  // Handlers
  const handleAddProject = () => {
    if (!newProjectName.trim()) {
      toast.error("Project name is required");
      return;
    }
    createProject.mutate({ name: newProjectName, description: newProjectDesc });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = async (event) => {
          const content = event.target?.result as string;
          uploadDocument.mutate({
            filename: file.name,
            content: content,
            size: file.size,
          });
        };
        reader.readAsText(file); // For demo, reading as text. Real apps might use S3.
      });
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Enter a search query");
      return;
    }
    const { data } = await webSearch.refetch();
    setSearchResults(data || []);
  };

  const handleExecuteCode = () => {
    if (!codeInput.trim()) {
      toast.error("Enter code to execute");
      return;
    }
    executeCode.mutate({ code: codeInput, language: "javascript" });
  };

  return (
    <div className="w-full space-y-2">
      {/* Projects Tool */}
      <div className="bg-card rounded-lg border border-border">
        <button
          onClick={() => toggleTool("projects")}
          className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Projects</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("projects") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("projects") && (
          <div className="border-t border-border p-3 space-y-2 bg-accent/30">
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Project name"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              />
              <input
                type="text"
                placeholder="Description"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                className="w-full px-2 py-1 text-sm border border-border rounded bg-background"
              />
              <Button
                onClick={handleAddProject}
                disabled={createProject.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-8"
              >
                {createProject.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin mr-1" />
                ) : (
                  <Plus className="w-3 h-3 mr-1" />
                )}
                Add Project
              </Button>
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {projectsLoading ? (
                <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-gray-400" /></div>
              ) : projects?.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-2 bg-card border border-border rounded text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-medium truncate">{project.name}</p>
                    <p className="text-muted-foreground truncate">{project.description}</p>
                  </div>
                  <button
                    onClick={() => deleteProject.mutate({ id: project.id })}
                    className="p-1 hover:bg-destructive/10 rounded shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
              {!projectsLoading && projects?.length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-2">No projects yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Documents Tool */}
      <div className="bg-card rounded-lg border border-border">
        <button
          onClick={() => toggleTool("documents")}
          className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Documents</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("documents") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("documents") && (
          <div className="border-t border-border p-3 space-y-2 bg-accent/30">
            <label className="block">
              <span className="text-xs font-medium text-muted-foreground mb-1 block">
                Upload Files
              </span>
              <input
                type="file"
                multiple
                onChange={handleFileUpload}
                className="w-full text-xs"
                disabled={uploadDocument.isPending}
              />
            </label>
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {documentsLoading ? (
                <div className="flex justify-center p-2"><Loader2 className="w-4 h-4 animate-spin text-muted-foreground" /></div>
              ) : documents?.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between p-2 bg-card border border-border rounded text-xs"
                >
                  <div className="truncate mr-2">
                    <p className="font-medium truncate">{doc.name}</p>
                    <p className="text-muted-foreground truncate">{doc.size}</p>
                  </div>
                  <button
                    onClick={() => deleteDocument.mutate({ id: doc.id })}
                    className="p-1 hover:bg-destructive/10 rounded shrink-0"
                  >
                    <Trash2 className="w-3 h-3 text-destructive" />
                  </button>
                </div>
              ))}
              {!documentsLoading && documents?.length === 0 && (
                <p className="text-center text-gray-400 text-[10px] py-2">No documents yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Web Search Tool */}
      <div className="bg-card rounded-lg border border-border">
        <button
          onClick={() => toggleTool("search")}
          className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Web Search</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("search") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("search") && (
          <div className="border-t border-border p-3 space-y-2 bg-accent/30">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-2 py-1 text-sm border border-border rounded bg-background"
              />
              <Button
                onClick={handleSearch}
                disabled={webSearch.isFetching}
                className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs px-2 py-1 h-8"
              >
                {webSearch.isFetching ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <Search className="w-3 h-3" />
                )}
              </Button>
            </div>
            <div className="space-y-1 max-h-40 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <a
                  key={idx}
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 bg-card border border-border rounded text-xs hover:bg-primary/10"
                >
                  <p className="font-medium text-primary truncate">
                    {result.title}
                  </p>
                  <p className="text-muted-foreground line-clamp-2">{result.snippet}</p>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Code Interpreter Tool */}
      <div className="bg-card rounded-lg border border-border">
        <button
          onClick={() => toggleTool("code")}
          className="w-full flex items-center justify-between p-3 hover:bg-accent transition-colors"
        >
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-primary" />
            <span className="font-medium text-sm">Code</span>
          </div>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              expandedTools.has("code") ? "rotate-180" : ""
            }`}
          />
        </button>
        {expandedTools.has("code") && (
          <div className="border-t border-border p-3 space-y-2 bg-accent/30">
            <textarea
              placeholder="Enter JavaScript code..."
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value)}
              className="w-full px-2 py-1 text-xs border border-border rounded font-mono h-20 bg-background"
            />
            <Button
              onClick={handleExecuteCode}
              disabled={executeCode.isPending}
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-xs py-1 h-8"
            >
              {executeCode.isPending ? (
                <Loader2 className="w-3 h-3 animate-spin mr-1" />
              ) : (
                <Code className="w-3 h-3 mr-1" />
              )}
              Execute
            </Button>
            {codeOutput && (
              <div className="p-2 bg-card border border-border rounded text-xs font-mono max-h-32 overflow-y-auto mt-2">
                <p className="text-foreground whitespace-pre-wrap">{codeOutput}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
