import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  display?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, display = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      return katex.renderToString(math, {
        displayMode: display,
        throwOnError: false,
      });
    } catch (e) {
      console.error('KaTeX error:', e);
      return math;
    }
  }, [math, display]);

  return (
    <div
      className={`overflow-x-auto overflow-y-hidden py-1 ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
