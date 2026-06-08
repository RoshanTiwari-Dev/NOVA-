import { useEffect } from 'react';

interface ShortcutConfig {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  callback: () => void;
}

export function useKeyboardShortcuts(shortcuts: ShortcutConfig[]) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      for (const shortcut of shortcuts) {
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();
        const ctrlMatch = shortcut.ctrlKey ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.altKey ? event.altKey : !event.altKey;

        if (keyMatch && ctrlMatch && shiftMatch && altMatch) {
          event.preventDefault();
          shortcut.callback();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts]);
}

export const KEYBOARD_SHORTCUTS = {
  NEW_CHAT: { key: 'n', ctrlKey: true, description: 'New Chat' },
  SEARCH: { key: 'k', ctrlKey: true, description: 'Search Conversations' },
  FAVORITE: { key: 'd', ctrlKey: true, description: 'Toggle Favorite' },
  FOCUS_INPUT: { key: '/', description: 'Focus Chat Input' },
  HELP: { key: '?', description: 'Show Help' },
  TOGGLE_DARK: { key: 'l', ctrlKey: true, shiftKey: true, description: 'Toggle Dark Mode' },
};
