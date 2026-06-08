import { useState, useRef, useEffect } from 'react';
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Download, Share2, Mic, MicOff, Volume2, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useSpeechRecognitionSimple } from "@/hooks/useSpeechRecognitionSimple";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { MessageWithImages } from "./MessageWithImages";

interface Message {
  id: number;
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export function ChatBoxModern({ conversationId }: { conversationId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Speech recognition hook
  const { isListening, isSpeaking, transcript, startListening, stopListening } = useSpeechRecognitionSimple({
    onTranscript: (text) => {
      setInputValue((prev) => (prev ? prev + " " + text : text));
      toast.success("Speech transcribed");
    },
    onError: (error) => {
      toast.error(`Microphone error: ${error}`);
    },
    silenceTimeout: 2000,
  });

  // Speech synthesis hook
  const { isPlaying, isPaused, speak, stop, togglePlayPause } = useSpeechSynthesis({
    voice: "female",
    rate: 1,
    pitch: 1,
    onStart: () => {
      // Audio started playing
    },
    onEnd: () => {
      setPlayingMessageId(null);
    },
  });

  // Fetch conversation history
  const { data: historyData } = trpc.chat.getHistory.useQuery({
    conversationId,
  });

  // Send message mutation
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
  const generateTitleMutation = trpc.chat.generateTitle.useMutation();
  const generateShareLinkMutation = trpc.chat.generateShareLink.useMutation();

  // Update messages when history is fetched
  useEffect(() => {
    if (historyData) {
      setMessages(
        historyData.map((msg) => ({
          ...msg,
          createdAt: new Date(msg.createdAt),
        }))
      );
    }
  }, [historyData]);

  // Auto-scroll to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Auto-resize textarea
  const autoResize = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = "auto";
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + "px";
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    autoResize(e.target);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    // Optimistically add user message
    const tempUserMessage: Message = {
      id: Date.now(),
      role: "user",
      content: userMessage,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, tempUserMessage]);

    setIsLoading(true);

    try {
      const response = await sendMessageMutation.mutateAsync({
        conversationId,
        message: userMessage,
      });

      // Add assistant message
      const assistantMessage: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: response.reply,
        createdAt: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Auto-generate title if this is the first message
      if (messages.length === 0) {
        try {
          await generateTitleMutation.mutateAsync({
            conversationId,
            firstMessage: userMessage,
          });
          toast.success("Conversation named");
        } catch (err) {
          console.error("Error generating title:", err);
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = async () => {
    try {
      const result = await trpc.chat.exportConversation.useQuery(
        { conversationId, format: "markdown" },
        { enabled: false }
      ).refetch();
      if (result.data) {
        const element = document.createElement("a");
        const file = new Blob([result.data.content], { type: "text/markdown" });
        element.href = URL.createObjectURL(file);
        element.download = result.data.filename;
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
        toast.success("Exported as Markdown");
      }
    } catch (error) {
      toast.error("Failed to export");
    }
  };

  const handleGenerateShareLink = async () => {
    try {
      const result = await generateShareLinkMutation.mutateAsync({ conversationId });
      const fullUrl = `${window.location.origin}${result.shareUrl}`;
      navigator.clipboard.writeText(fullUrl);
      toast.success("Share link copied to clipboard");
    } catch (error) {
      toast.error("Failed to generate share link");
    }
  };

  const handleSpeakMessage = (messageId: number, content: string) => {
    if (playingMessageId === messageId && isPlaying) {
      stop();
      setPlayingMessageId(null);
    } else {
      setPlayingMessageId(messageId);
      speak(content);
    }
  };

  const handleMicrophoneClick = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">AI</span>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800 mb-2">
                How can I help you today?
              </h2>
              <p className="text-gray-500">Start a conversation by typing a message below or use the microphone</p>
            </div>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex gap-3 ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {message.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs">AI</span>
              </div>
            )}

            <div
              className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg group ${
                message.role === "user"
                  ? "bg-green-600 text-white rounded-br-none"
                  : "bg-gray-100 text-gray-800 rounded-bl-none border border-gray-200"
              }`}
            >
              {message.role === "assistant" ? (
                <MessageWithImages content={message.content} role="assistant" showImages={true} />
              ) : (
                <p className="text-sm leading-relaxed">{message.content}</p>
              )}

              {/* Speaker Button for AI Messages */}
              {message.role === "assistant" && (
                <div className="mt-2 flex gap-2">
                  <Button
                    onClick={() => handleSpeakMessage(message.id, message.content)}
                    size="sm"
                    variant="ghost"
                    className={`h-6 px-2 text-xs ${
                      playingMessageId === message.id && isPlaying
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                  >
                    {playingMessageId === message.id && isPlaying ? (
                      <>
                        <Pause className="w-3 h-3 mr-1" />
                        Stop
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3 h-3 mr-1" />
                        Listen
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            {message.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-green-600 flex-shrink-0 flex items-center justify-center">
                <span className="text-white font-bold text-xs">You</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex-shrink-0 flex items-center justify-center">
              <span className="text-white font-bold text-xs">AI</span>
            </div>
            <div className="bg-gray-100 text-gray-800 px-4 py-3 rounded-lg rounded-bl-none border border-gray-200 flex gap-2">
              <div className="w-2 h-2 rounded-full bg-green-600 animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-green-600 animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-green-600 animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}

        {/* Recording Indicator */}
        {isListening && (
          <div className="flex gap-3 items-center justify-center py-2">
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-full px-4 py-2">
              <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
              <span className="text-sm font-medium text-red-600">Listening...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Export/Share Buttons */}
      {messages.length > 0 && (
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-3 flex gap-2 justify-end">
          <Button
            onClick={handleExportMarkdown}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Download className="w-3 h-3 mr-1" />
            Export MD
          </Button>
          <Button
            onClick={handleGenerateShareLink}
            disabled={generateShareLinkMutation.isPending}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            <Share2 className="w-3 h-3 mr-1" />
            Share
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="flex gap-3 items-end bg-gray-50 border border-gray-300 rounded-lg p-3 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500 transition-all">
          {/* Microphone Button */}
          <Button
            onClick={handleMicrophoneClick}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className={`flex-shrink-0 h-10 w-10 p-0 ${
              isListening
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            title={isListening ? "Stop listening" : "Start listening"}
          >
            {isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
          </Button>

          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message or use the microphone... (Shift+Enter for new line)"
            className="flex-1 bg-transparent text-gray-800 placeholder-gray-500 outline-none resize-none max-h-32 text-sm leading-relaxed"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0 transition-all"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-xs text-gray-500 mt-2 px-1">
          Press Enter to send, Shift+Enter for new line, or click the microphone to speak
        </p>
      </div>
    </div>
  );
}
