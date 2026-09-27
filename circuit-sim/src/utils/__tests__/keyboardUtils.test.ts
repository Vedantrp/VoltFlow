import { describe, it, expect } from 'vitest';
import { isTypingInInput } from '../keyboardUtils';

describe('keyboardUtils Tests', () => {
  it('returns false for plain non-input target', () => {
    const dummyTarget = {
      tagName: 'DIV',
      isContentEditable: false,
      closest: () => null,
    };
    const dummyEvent = {
      target: dummyTarget,
    } as unknown as KeyboardEvent;

    expect(isTypingInInput(dummyEvent)).toBe(false);
  });

  it('detects standard INPUT target tag', () => {
    const inputTarget = {
      tagName: 'INPUT',
      isContentEditable: false,
      closest: () => null,
    };
    const dummyEvent = {
      target: inputTarget,
    } as unknown as KeyboardEvent;

    expect(isTypingInInput(dummyEvent)).toBe(true);
  });

  it('detects standard TEXTAREA target tag', () => {
    const textareaTarget = {
      tagName: 'TEXTAREA',
      isContentEditable: false,
      closest: () => null,
    };
    const dummyEvent = {
      target: textareaTarget,
    } as unknown as KeyboardEvent;

    expect(isTypingInInput(dummyEvent)).toBe(true);
  });

  it('detects contentEditable target element', () => {
    const editableTarget = {
      tagName: 'DIV',
      isContentEditable: true,
      closest: () => null,
    };
    const dummyEvent = {
      target: editableTarget,
    } as unknown as KeyboardEvent;

    expect(isTypingInInput(dummyEvent)).toBe(true);
  });

  it('detects Monaco Editor child element via closest() method', () => {
    const monacoChildTarget = {
      tagName: 'DIV',
      isContentEditable: false,
      closest: (selector: string) => {
        if (selector === '.monaco-editor') return {};
        return null;
      },
    };
    const dummyEvent = {
      target: monacoChildTarget,
    } as unknown as KeyboardEvent;

    expect(isTypingInInput(dummyEvent)).toBe(true);
  });
});
