import React, { useMemo } from 'react';
import katex from 'katex';

interface MathTextProps {
  text: string;
  className?: string;
  as?: 'span' | 'div' | 'p';
}

interface Token {
  type: 'text' | 'inline-math' | 'block-math';
  content: string;
}

/**
 * Splits a string into plain text, inline math ($...$), and block math ($$...$$)
 * while respecting escaped dollar signs (\$).
 */
function tokenizeMath(input: string): Token[] {
  if (!input) return [];

  const tokens: Token[] = [];
  const regex = /(?<!\\)\$\$([\s\S]*?)(?<!\\)\$\$|(?<!\\)\$([\s\S]*?)(?<!\\)\$/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(input)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({
        type: 'text',
        content: input.slice(lastIndex, match.index),
      });
    }

    if (match[1] !== undefined) {
      tokens.push({
        type: 'block-math',
        content: match[1].trim(),
      });
    } else if (match[2] !== undefined) {
      tokens.push({
        type: 'inline-math',
        content: match[2].trim(),
      });
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < input.length) {
    tokens.push({
      type: 'text',
      content: input.slice(lastIndex),
    });
  }

  return tokens;
}

/**
 * Formats non-math text segments with lightweight markdown support (**bold** and _italic_)
 */
function renderFormattedText(text: string, keyPrefix: string): React.ReactNode[] {
  const unescaped = text.replace(/\\\$/g, '$');
  // Match **bold** or _italic_
  const mdRegex = /\*\*([^*]+)\*\*|_([^_]+)_/g;
  const parts: React.ReactNode[] = [];
  let lastIdx = 0;
  let match: RegExpExecArray | null;
  let subIdx = 0;

  while ((match = mdRegex.exec(unescaped)) !== null) {
    if (match.index > lastIdx) {
      parts.push(unescaped.slice(lastIdx, match.index));
    }
    if (match[1] !== undefined) {
      parts.push(
        <strong key={`${keyPrefix}-b-${subIdx++}`} className="font-bold text-espresso-900">
          {match[1]}
        </strong>
      );
    } else if (match[2] !== undefined) {
      parts.push(
        <em key={`${keyPrefix}-i-${subIdx++}`} className="italic text-espresso-900">
          {match[2]}
        </em>
      );
    }
    lastIdx = mdRegex.lastIndex;
  }

  if (lastIdx < unescaped.length) {
    parts.push(unescaped.slice(lastIdx));
  }

  return parts;
}

export const MathText: React.FC<MathTextProps> = ({
  text,
  className = '',
  as: Component = 'span',
}) => {
  const renderedNodes = useMemo(() => {
    const tokens = tokenizeMath(text);

    return tokens.map((token, idx) => {
      if (token.type === 'text') {
        return <React.Fragment key={idx}>{renderFormattedText(token.content, `t-${idx}`)}</React.Fragment>;
      }

      const displayMode = token.type === 'block-math';
      try {
        const html = katex.renderToString(token.content, {
          displayMode,
          throwOnError: false,
          strict: false,
          trust: true,
        });

        if (displayMode) {
          return (
            <span
              key={idx}
              className="my-2.5 block overflow-x-auto py-1 text-espresso-900"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        }

        return (
          <span
            key={idx}
            className="inline-block align-baseline text-espresso-900"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      } catch {
        return (
          <code key={idx} className="rounded bg-roseGold-blush px-1 py-0.5 text-sm text-espresso-900">
            {token.content}
          </code>
        );
      }
    });
  }, [text]);

  return <Component className={className}>{renderedNodes}</Component>;
};

