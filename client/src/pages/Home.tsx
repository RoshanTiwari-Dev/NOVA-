import { useEffect, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

import { trpc } from "@/lib/trpc";
import { Loader2 } from "lucide-react";
import { ModernLayout } from "@/components/ModernLayout";
import { ChatBoxModern } from "@/components/ChatBoxModern";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: number;
  title: string;
  updatedAt: Date;
}

export default function Home() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isInitializing, setIsInitializing] = useState(false);

  // Mutations and Queries
  const createConversationMutation = trpc.chat.createConversation.useMutation();
  const { data: conversationsData } = trpc.chat.getConversations.useQuery();
  const deleteConversationMutation = trpc.chat.deleteConversation.useMutation();
  const renameConversationMutation = trpc.chat.renameConversation.useMutation();

  // Initialize or load conversations
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const initializeChat = async () => {
      setIsInitializing(true);
      try {
        // Load existing conversations
        if (conversationsData) {
          const formattedConvs = conversationsData.map((c: any) => ({
            ...c,
            updatedAt: new Date(c.updatedAt),
          }));
          setConversations(formattedConvs);

          // Set current conversation to the most recent one, or create a new one
          if (formattedConvs.length > 0) {
            setConversationId(formattedConvs[0].id);
          } else {
            await createNewChat();
          }
        }
      } catch (error) {
        console.error("Error initializing chat:", error);
        await createNewChat();
      } finally {
        setIsInitializing(false);
      }
    };

    initializeChat();
  }, [isAuthenticated, user]);

  const createNewChat = async () => {
    try {
      const result = await createConversationMutation.mutateAsync();
      setConversationId(result.conversationId);
      // Refresh conversations list
      if (conversationsData) {
        const formattedConvs = conversationsData.map((c: any) => ({
          ...c,
          updatedAt: new Date(c.updatedAt),
        }));
        setConversations(formattedConvs);
      }
    } catch (error) {
      console.error("Error creating new chat:", error);
    }
  };

  const handleDeleteConversation = async (id: number) => {
    try {
      await deleteConversationMutation.mutateAsync({ conversationId: id });
      setConversations((prev) => prev.filter((c) => c.id !== id));
      setFilteredConversations((prev) => prev.filter((c) => c.id !== id));
      if (conversationId === id) {
        await createNewChat();
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setFilteredConversations(conversations);
      return;
    }
    const query_lower = query.toLowerCase();
    const results = conversations.filter((conv) =>
      conv.title.toLowerCase().includes(query_lower)
    );
    setFilteredConversations(results);
  };

  const handleRenameConversation = async (id: number, newTitle: string) => {
    try {
      await renameConversationMutation.mutateAsync({ conversationId: id, newTitle });
      setConversations((prev) =>
        prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
      );
    } catch (error) {
      console.error("Error renaming conversation:", error);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-3xl">✨</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Nova</h1>
          <p className="text-gray-600 mb-8">AI-powered conversations at your fingertips</p>
          <Button
            onClick={() => (window.location.href = "/login")}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-2"
          >
            Sign In to Chat
          </Button>
        </div>
      </div>
    );
  }

  if (isInitializing || !conversationId) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Initializing chat...</p>
        </div>
      </div>
    );
  }

  return (
    <ModernLayout
      conversations={filteredConversations.length > 0 ? filteredConversations : conversations}
      currentConversationId={conversationId}
      onSelectConversation={setConversationId}
      onNewChat={createNewChat}
      onDeleteConversation={handleDeleteConversation}
      onRenameConversation={handleRenameConversation}
      onSearch={handleSearch}
    >
      <ChatBoxModern conversationId={conversationId} />
    </ModernLayout>
  );
}
