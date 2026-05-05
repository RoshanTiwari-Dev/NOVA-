import { useState } from "react";
import { Menu, X, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToolsManagerEnhanced } from "./ToolsManagerEnhanced";
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
  onSearch?: (query: string) => void;
  children: React.ReactNode;
}

export function ModernLayout({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onSearch,
  children,
}: ModernLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-0"
        } transition-all duration-300 bg-white border-r border-gray-200 flex flex-col overflow-hidden`}
      >
        {/* Tools & Features Panel - TOP */}
        <div className="border-b border-gray-200 p-4 max-h-96 overflow-y-auto">
          <ToolsManagerEnhanced />
        </div>

        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200 space-y-3">
          <Button
            onClick={onNewChat}
            className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </Button>
          {onSearch && (
            <SearchBar onSearch={onSearch} />
          )}
        </div>

        {/* Conversations List - BOTTOM */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide px-2 mb-3">
            Chat History
          </div>
          {conversations.length === 0 ? (
            <div className="text-center text-gray-400 text-sm py-8">
              No conversations yet
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`group p-3 rounded-lg cursor-pointer transition-colors ${
                  currentConversationId === conv.id
                    ? "bg-green-100 text-green-900"
                    : "hover:bg-gray-100 text-gray-800"
                }`}
                onClick={() => onSelectConversation(conv.id)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{conv.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(conv.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteConversation(conv.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-100 rounded"
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Settings & Analytics Links */}
        <div className="border-t border-gray-200 p-4 space-y-2">
          <a href="/analytics" className="block w-full px-4 py-2 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium text-center">
            📊 Analytics
          </a>
          <a href="/settings" className="block w-full px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium text-center">
            ⚙️ Settings
          </a>
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
          <div className="w-9" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
}
