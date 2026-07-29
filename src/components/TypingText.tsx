'use client';

import { useEffect, useState } from 'react';

export interface TypingSegment {
  text: string;
  className?: string;
}

const CHAR_MS = 32;

/**
 * Types out `segments` once on mount, character by character, preserving
 * per-segment styling (e.g. one highlighted word) and `\n` as line breaks.
 * Runs instantly (no animation) under prefers-reduced-motion.
 */
export function TypingText({ segments, className }: { segments: TypingSegment[]; className?: string }) {
  const fullLength = segments.reduce((n, s) => n + s.text.length, 0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCount(fullLength);
      return;
    }

    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setCount(i);
      if (i >= fullLength) clearInterval(id);
    }, CHAR_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullLength]);

  let remaining = count;
  return (
    <span className={className}>
      {segments.map((seg, i) => {
        const visible = seg.text.slice(0, Math.max(0, remaining));
        remaining -= seg.text.length;
        const lines = visible.split('\n');
        return (
          <span key={i} className={seg.className}>
            {lines.map((line, j) => (
              <span key={j}>
                {j > 0 && <br />}
                {line}
              </span>
            ))}
          </span>
        );
      })}
      <span
        aria-hidden="true"
        className="typing-cursor ml-0.5 inline-block w-[2px] translate-y-[0.1em] bg-cobalt align-middle"
        style={{ height: '0.85em' }}
      />
    </span>
  );
}
