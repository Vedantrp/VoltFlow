import React, { useEffect, useRef } from 'react';

/**
 * Generic wrapper that mounts a wokwi-elements custom element and keeps its
 * DOM properties (not just attributes) in sync with React props. Custom
 * element properties like `value` (boolean) or `brightness` (number) don't
 * round-trip correctly through JSX string attributes, so we set them
 * directly on the element instance via a ref.
 */
export function WokwiElement<T extends HTMLElement>({
  tag,
  props,
  style,
  onClick,
  events,
}: {
  tag: string;
  props: Record<string, unknown>;
  style?: React.CSSProperties;
  onClick?: () => void;
  events?: Record<string, (e: Event) => void>;
}) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    for (const [key, value] of Object.entries(props)) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (el as any)[key] = value;
      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        el.setAttribute(key, String(value));
      }
    }
  }, [props]);

  useEffect(() => {
    const el = ref.current;
    if (!el || !events) return;
    for (const [name, handler] of Object.entries(events)) {
      el.addEventListener(name, handler);
    }
    return () => {
      for (const [name, handler] of Object.entries(events)) {
        el.removeEventListener(name, handler);
      }
    };
  }, [events]);

  return React.createElement(tag, {
    ref,
    style: {
      display: 'block',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      ...style,
    },
    onClick,
  });
}
