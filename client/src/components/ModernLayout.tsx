import { useState } from "react";
import { Menu, X, Plus, Trash2, Settings, MoreVertical, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolsPanel } from "./ToolsPanel";
import { SearchBar } from "./SearchBar";
import { useTheme } from "@/contexts/ThemeContext";

interface Conversation {
  id: number;
  title: string;
  updatedAt: Date;
}

interface ModernLayoutProps {
  conversations: Conversation[];
  currentConversationId: number | null;
  onSelectConversation: (id: number) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: number) => void;
  onRenameConversation?: (id: number, newTitle: string) => void;
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export function ModernLayout({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onSearch,
  children,
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [renamingId, setRenamingId] = useState<number | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const { theme, toggleTheme } = useTheme();

  const handleRename = (id: number, currentTitle: string) => {
    setRenamingId(id);
    setNewTitle(currentTitle);
  };

  const handleSaveRename = (id: number) => {
    if (newTitle.trim() && onRenameConversation) {
      onRenameConversation(id, newTitle.trim());
      setRenamingId(null);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-card border-r border-border flex flex-col overflow-hidden`}
      >
        {/* Tools & Features Panel */}
        <div className="border-b border-border p-2 max-h-48 overflow-y-auto">
          <ToolsPanel />
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-border">
          <Button
            onClick={onNewChat}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-border">
          {onSearch && <SearchBar onSearch={onSearch} />}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-semibold text-muted-foreground mb-2">CHAT HISTORY</div>
          {conversations.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group p-2 rounded-lg cursor-pointer transition-all ${
                    currentConversationId === conv.id
                      ? "bg-primary/10 border border-primary/30"
                      : "hover:bg-accent border border-transparent"
                  }`}
                >
                  {renamingId === conv.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-primary/30 rounded bg-background"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(conv.id)}
                        className="text-xs px-2 py-1 bg-primary text-primary-foreground rounded hover:bg-primary/90"
                      >
                        Save
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => onSelectConversation(conv.id)}
                      className="flex items-start justify-between gap-2"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(conv.id, conv.title);
                          }}
                          className="p-0.5 hover:bg-primary/10 rounded"
                          title="Rename"
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-0.5 hover:bg-destructive/10 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-destructive" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Menu className="w-5 h-5 text-muted-foreground" />
              )}
            </button>
            <h1 className="text-lg font-semibold text-foreground">✨ Nova</h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5 text-muted-foreground" />
              ) : (
                <Sun className="w-5 h-5 text-muted-foreground" />
              )}
            </button>

            {/* Settings Dropdown */}
            <div className="relative">
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="p-2 hover:bg-accent rounded-lg transition-colors"
              >
                <MoreVertical className="w-5 h-5 text-muted-foreground" />
              </button>
              {settingsOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <a
                    href="#settings"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent border-b border-border"
                  >
                    <Settings className="w-4 h-4 inline mr-2" />
                    Settings
                  </a>
                  <a
                    href="#help"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent border-b border-border"
                  >
                    ❓ Help & Support
                  </a>
                  <a
                    href="#about"
                    className="block px-4 py-2 text-sm text-foreground hover:bg-accent"
                  >
                    ℹ️ About Nova
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto bg-background">{children}</div>
      </div>
    </div>
  );
}
