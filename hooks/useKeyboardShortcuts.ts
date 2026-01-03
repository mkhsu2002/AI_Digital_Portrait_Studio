import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  [key: string]: () => void;
}

/**
 * Hook for handling keyboard shortcuts
 */
export const useKeyboardShortcuts = (shortcuts: KeyboardShortcuts) => {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      // 忽略在輸入框中的快捷鍵
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return;
      }

      // 檢查是否有對應的快捷鍵
      const key = event.key.toLowerCase();
      const modifier = event.ctrlKey || event.metaKey ? 'ctrl+' : '';
      const shortcutKey = `${modifier}${key}`;

      if (shortcuts[shortcutKey] || shortcuts[key]) {
        event.preventDefault();
        (shortcuts[shortcutKey] || shortcuts[key])();
      }
    },
    [shortcuts]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
};






