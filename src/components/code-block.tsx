import Highlight, { defaultProps, Language, PrismTheme } from 'prism-react-renderer';
import React from 'react';

export interface CodeBlockProps {
  children: string;
  className?: string;
  style?: React.CSSProperties;
  theme?: PrismTheme;
}

export default function CodeBlock({ children, className, theme, style: outerStyle }: CodeBlockProps) {
  const lang = className?.match(/language-(?<lang>.*)/)?.groups?.lang || '';

  return (
    <Highlight
      {...defaultProps}
      code={children.trim()}
      language={lang as Language}
      theme={theme}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code className={className} style={{ display: 'block', ...style, ...outerStyle }}>
          {tokens.map((line, i) => (
            <div key={i} {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span key={key} {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </code>
      )}
    </Highlight>
  )
}
