import { useState } from "react";
import { Menu, X, Plus, Trash2, Settings, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolsPanel } from "./ToolsPanel";
import { SearchBar } from "./SearchBar";

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
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        {/* Tools & Features Panel */}
        <div className="border-b border-gray-200 p-2 max-h-48 overflow-y-auto">
          <ToolsPanel />
        </div>

        {/* New Chat Button */}
        <div className="p-3 border-b border-gray-200">
          <Button
            onClick={onNewChat}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 rounded-lg flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
        </div>

        {/* Search */}
        <div className="px-3 py-2 border-b border-gray-200">
          {onSearch && <SearchBar onSearch={onSearch} />}
        </div>

        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="text-xs font-semibold text-gray-600 mb-2">CHAT HISTORY</div>
          {conversations.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No conversations yet</p>
          ) : (
            <div className="space-y-2">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`group p-2 rounded-lg cursor-pointer transition-all ${
                    currentConversationId === conv.id
                      ? "bg-green-100 border border-green-300"
                      : "hover:bg-gray-100 border border-transparent"
                  }`}
                >
                  {renamingId === conv.id ? (
                    <div className="flex gap-1">
                      <input
                        type="text"
                        value={newTitle}
                        onChange={(e) => setNewTitle(e.target.value)}
                        className="flex-1 text-xs px-2 py-1 border border-green-300 rounded"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveRename(conv.id)}
                        className="text-xs px-2 py-1 bg-green-600 text-white rounded hover:bg-green-700"
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
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(conv.updatedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRename(conv.id, conv.title);
                          }}
                          className="p-0.5 hover:bg-blue-100 rounded"
                          title="Rename"
                        >
                          <span className="text-xs">✏️</span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteConversation(conv.id);
                          }}
                          className="p-0.5 hover:bg-red-100 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 text-red-600" />
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
        <div className="border-b border-gray-200 bg-white px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-gray-600" />
            ) : (
              <Menu className="w-5 h-5 text-gray-600" />
            )}
          </button>
          <h1 className="text-lg font-semibold text-gray-800">✨ Nova</h1>
          
          {/* Settings Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSettingsOpen(!settingsOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <MoreVertical className="w-5 h-5 text-gray-600" />
            </button>
            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                <a
                  href="#settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                >
                  <Settings className="w-4 h-4 inline mr-2" />
                  Settings
                </a>
                <a
                  href="#help"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 border-b border-gray-200"
                >
                  ❓ Help & Support
                </a>
                <a
                  href="#about"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  ℹ️ About Nova
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
}
