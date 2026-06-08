import { useState } from 'react';
import { Edit2, RotateCcw, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MessageEditorProps {
  messageId: number;
  originalContent: string;
  isUserMessage: boolean;
  onEdit?: (messageId: number, newContent: string) => void;
  onRegenerate?: (messageId: number) => void;
  isDarkMode?: boolean;
}

export function MessageEditor({
  messageId,
  originalContent,
  isUserMessage,
  onEdit,
  onRegenerate,
  isDarkMode = false,
}: MessageEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(originalContent);
  const [isRegenerating, setIsRegenerating] = useState(false);

  const handleEdit = () => {
    if (editedContent.trim() !== originalContent) {
      onEdit?.(messageId, editedContent);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedContent(originalContent);
    setIsEditing(false);
  };

  const handleRegenerate = async () => {
    setIsRegenerating(true);
    try {
      onRegenerate?.(messageId);
    } finally {
      setIsRegenerating(false);
    }
  };

  if (isEditing) {
    return (
      <div className={`space-y-2 p-3 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
        <textarea
          value={editedContent}
          onChange={(e) => setEditedContent(e.target.value)}
          className={`w-full p-2 rounded border ${
            isDarkMode
              ? 'bg-gray-700 border-gray-600 text-white'
              : 'bg-white border-gray-300 text-gray-900'
          } focus:outline-none focus:ring-2 focus:ring-green-500`}
          rows={3}
        />
        <div className="flex gap-2">
          <Button
            onClick={handleEdit}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Save
          </Button>
          <Button
            onClick={handleCancel}
            className={`flex-1 ${
              isDarkMode
                ? 'bg-gray-700 hover:bg-gray-600 text-white'
                : 'bg-gray-300 hover:bg-gray-400 text-gray-900'
            } flex items-center justify-center gap-2`}
          >
            <X className="w-4 h-4" />
            Cancel
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2 mt-2">
      {isUserMessage && (
        <button
          onClick={() => setIsEditing(true)}
          className={`p-1.5 rounded transition-colors ${
            isDarkMode
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
          title="Edit message"
        >
          <Edit2 className="w-4 h-4" />
        </button>
      )}

      {!isUserMessage && (
        <button
          onClick={handleRegenerate}
          disabled={isRegenerating}
          className={`p-1.5 rounded transition-colors flex items-center gap-1 ${
            isRegenerating
              ? 'opacity-50 cursor-not-allowed'
              : isDarkMode
              ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-300'
              : 'hover:bg-gray-200 text-gray-600 hover:text-gray-900'
          }`}
          title="Regenerate response"
        >
          <RotateCcw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
        </button>
      )}
    </div>
  );
}
