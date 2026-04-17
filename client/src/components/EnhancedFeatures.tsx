import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Mic, Zap, Star, FolderPlus, Palette, Keyboard, Settings } from "lucide-react";
import { toast } from "sonner";

export function EnhancedFeatures() {
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedTone, setSelectedTone] = useState("balanced");
  const [darkMode, setDarkMode] = useState(false);

  const templates = [
    { id: "brainstorm", name: "Brainstorming", description: "Generate creative ideas" },
    { id: "summarize", name: "Summarize", description: "Condense text into key points" },
    { id: "explain", name: "Explain", description: "Break down complex topics" },
    { id: "code", name: "Code Helper", description: "Get coding assistance" },
    { id: "writing", name: "Writing", description: "Improve your writing" },
    { id: "research", name: "Research", description: "Gather information" },
  ];

  const tones = [
    { id: "formal", name: "Formal", icon: "📋" },
    { id: "casual", name: "Casual", icon: "😊" },
    { id: "balanced", name: "Balanced", icon: "⚖️" },
    { id: "creative", name: "Creative", icon: "🎨" },
    { id: "technical", name: "Technical", icon: "🔧" },
  ];

  const handleVoiceToggle = async () => {
    if (!voiceEnabled) {
      try {
        const recognition = new (window as any).webkitSpeechRecognition();
        recognition.onstart = () => toast.success("Listening...");
        recognition.onend = () => toast.info("Recording stopped");
        recognition.start();
        setVoiceEnabled(true);
      } catch (error) {
        toast.error("Voice input not supported in your browser");
      }
    } else {
      setVoiceEnabled(false);
    }
  };

  const handleAddFavorite = (templateId: string) => {
    if (favorites.includes(templateId)) {
      setFavorites(favorites.filter((id) => id !== templateId));
      toast.success("Removed from favorites");
    } else {
      setFavorites([...favorites, templateId]);
      toast.success("Added to favorites");
    }
  };

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
    toast.success(`${!darkMode ? "Dark" : "Light"} mode enabled`);
  };

  return (
    <div className="w-full bg-white rounded-lg border border-gray-200 p-6 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Enhanced Features</h2>

      {/* Voice Input */}
      <Card className="p-4 border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Mic className={`w-6 h-6 ${voiceEnabled ? "text-green-500" : "text-gray-400"}`} />
            <div>
              <h3 className="font-semibold text-gray-900">Voice Input</h3>
              <p className="text-sm text-gray-600">Speak your messages hands-free</p>
            </div>
          </div>
          <Button
            onClick={handleVoiceToggle}
            className={`${voiceEnabled ? "bg-red-500 hover:bg-red-600" : "bg-green-500 hover:bg-green-600"} text-white`}
          >
            {voiceEnabled ? "Stop" : "Start"}
          </Button>
        </div>
      </Card>

      {/* Conversation Templates */}
      <Card className="p-4 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-500" />
          Conversation Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {templates.map((template) => (
            <div key={template.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors">
              <div>
                <p className="font-medium text-gray-900">{template.name}</p>
                <p className="text-xs text-gray-600">{template.description}</p>
              </div>
              <button
                onClick={() => handleAddFavorite(template.id)}
                className="text-gray-400 hover:text-yellow-500 transition-colors"
              >
                <Star className={`w-5 h-5 ${favorites.includes(template.id) ? "fill-yellow-500 text-yellow-500" : ""}`} />
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* AI Personality/Tone */}
      <Card className="p-4 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Palette className="w-5 h-5 text-purple-500" />
          AI Personality
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
          {tones.map((tone) => (
            <button
              key={tone.id}
              onClick={() => {
                setSelectedTone(tone.id);
                toast.success(`Switched to ${tone.name} mode`);
              }}
              className={`p-3 rounded-lg border-2 transition-all ${
                selectedTone === tone.id ? "border-green-500 bg-green-50" : "border-gray-200 hover:border-green-300"
              }`}
            >
              <div className="text-2xl mb-1">{tone.icon}</div>
              <p className="text-xs font-medium text-gray-900">{tone.name}</p>
            </button>
          ))}
        </div>
      </Card>

      {/* Keyboard Shortcuts */}
      <Card className="p-4 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Keyboard className="w-5 h-5 text-blue-500" />
          Keyboard Shortcuts
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Send message</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New line</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Shift + Enter</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Focus input</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl + /</kbd>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">New chat</span>
            <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">Ctrl + N</kbd>
          </div>
        </div>
      </Card>

      {/* Settings & Preferences */}
      <Card className="p-4 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Settings className="w-5 h-5 text-gray-600" />
          Settings & Preferences
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Dark Mode</span>
            <Button
              onClick={handleToggleDarkMode}
              className={`${darkMode ? "bg-green-500" : "bg-gray-300"} text-white w-12 h-6`}
            >
              {darkMode ? "On" : "Off"}
            </Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Auto-save Conversations</span>
            <Button className="bg-green-500 hover:bg-green-600 text-white w-12 h-6">On</Button>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-gray-700">Notifications</span>
            <Button className="bg-green-500 hover:bg-green-600 text-white w-12 h-6">On</Button>
          </div>
        </div>
      </Card>

      {/* Conversation Organization */}
      <Card className="p-4 border-gray-200">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FolderPlus className="w-5 h-5 text-blue-500" />
          Organize Conversations
        </h3>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Create new folder..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <Button className="bg-green-500 hover:bg-green-600 text-white">Create</Button>
        </div>
      </Card>
    </div>
  );
}
