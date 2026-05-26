import { useState, useRef, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Streamdown } from "streamdown";
import { Button } from "@/components/ui/button";
import { Loader2, Send, Download, Share2, Mic, MicOff, Volume2, Pause } from "lucide-react";
import { toast } from "sonner";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { useTheme } from "@/contexts/ThemeContext";

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
  const [playingMessageId, setPlayingMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { theme } = useTheme();

  // Speech recognition hook
  const { isListening, startListening, stopListening } = useSpeechRecognition({
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
  const { isPlaying, speak, stop } = useSpeechSynthesis({
    voice: "female",
    rate: 1,
    pitch: 1,
    onStart: () => {},
    onEnd: () => {
      setPlayingMessageId(null);
    },
  });

  // Fetch conversation history
  const { data: historyData } = trpc.chat.getHistory.useQuery({
    conversationId,
  });

  // Mutations
  const sendMessageMutation = trpc.chat.sendMessage.useMutation();
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
    } catch (error) {
      console.error("Error sending message:", error);
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportMarkdown = async () => {
    // Logic for export
    toast.info("Exporting...");
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
    <div className="flex flex-col h-full bg-background">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-4">
        {messages.length === 0 && !isLoading && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
                <span className="text-primary-foreground font-bold text-2xl">AI</span>
              </div>
              <h2 className="text-2xl font-semibold text-foreground mb-2">
                How can I help you today?
              </h2>
              <p className="text-muted-foreground">Start a conversation by typing a message below or use the microphone</p>
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
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">AI</span>
              </div>
            )}

            <div
              className={`max-w-md lg:max-w-lg px-4 py-3 rounded-lg group ${
                message.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-none"
                  : "bg-muted text-foreground rounded-bl-none border border-border"
              }`}
            >
              {message.role === "assistant" ? (
                <Streamdown>{message.content}</Streamdown>
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
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "bg-accent text-accent-foreground hover:bg-accent/80"
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
              <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">You</span>
              </div>
            )}
          </div>
        ))}

        {/* Typing Indicator */}
        {isLoading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-primary flex-shrink-0 flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">AI</span>
            </div>
            <div className="bg-muted text-foreground px-4 py-3 rounded-lg rounded-bl-none border border-border flex gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
              <div
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0.2s" }}
              />
              <div
                className="w-2 h-2 rounded-full bg-primary animate-bounce"
                style={{ animationDelay: "0.4s" }}
              />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Export/Share Buttons */}
      {messages.length > 0 && (
        <div className="border-t border-border bg-accent/20 px-6 py-3 flex gap-2 justify-end">
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
      <div className="border-t border-border bg-background px-6 py-4">
        <div className="flex gap-3 items-end bg-accent/30 border border-border rounded-lg p-3 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Button
            onClick={handleMicrophoneClick}
            disabled={isLoading}
            size="sm"
            variant="ghost"
            className={`flex-shrink-0 h-10 w-10 p-0 ${
              isListening
                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                : "bg-accent text-accent-foreground hover:bg-accent/80"
            }`}
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
            placeholder="Type your message..."
            className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none resize-none max-h-32 text-sm leading-relaxed"
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSendMessage}
            disabled={isLoading || !inputValue.trim()}
            className="bg-primary hover:bg-primary/90 text-primary-foreground flex-shrink-0 transition-all"
            size="sm"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
