/**
 * Utility helper to determine if a keyboard event was triggered while the user
 * is typing inside any text input, textarea, select dropdown, contenteditable element,
 * or code editor (such as Monaco Editor).
 */
export function isTypingInInput(e: KeyboardEvent): boolean {
  const target = e.target as HTMLElement | null;
  const active = typeof document !== 'undefined' ? (document.activeElement as HTMLElement | null) : null;

  const isInputOrEditable = (el: HTMLElement | null): boolean => {
    if (!el) return false;
    const tag = el.tagName ? el.tagName.toUpperCase() : '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (el.isContentEditable) return true;
    if (
      el.closest('.monaco-editor') ||
      el.closest('.monaco-component') ||
      el.closest('[contenteditable="true"]') ||
      el.closest('.code-editor-panel')
    ) {
      return true;
    }
    return false;
  };

  return isInputOrEditable(target) || isInputOrEditable(active);
}
