import {
  Highlight,
  Language,
  PrismTheme,
} from 'prism-react-renderer';
import React from 'react';
import { useTheme } from '@mui/material';

export interface CodeBlockProps {
  children: string;
  language: Language;
  codeStyle?: React.CSSProperties;
}

export default ({ children, codeStyle, language }: CodeBlockProps) => {
  const theme = useTheme();
  const prismTheme =
    theme.palette.mode === 'light' ? require('prism-react-renderer').themes.github : require('prism-react-renderer').themes.vsDark;

  return (
    <Highlight
      code={children.trim()}
      theme={prismTheme as PrismTheme}
      language={language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <code
          className={className}
          style={{
            display: 'block',
            padding: 20,
            overflowX: 'auto',
            borderRadius: 5,
            ...style,
            ...codeStyle,
          }}
        >
          {tokens.map((line, i) => {
            if (line.length === 1 && line[0].content.indexOf('\u200b') > -1) {
              return <br />;
            }
            return (
              <div key={i} {...getLineProps({ line, key: i })}>
                {line.map((token, key) => {
                  const tokenProps = getTokenProps({ token, key });
                  tokenProps.style = {
                    ...tokenProps.style,
                    whiteSpace: 'pre',
                  };
                  return <span key={key} {...tokenProps} />;
                })}
              </div>
            );
          })}
        </code>
      )}
    </Highlight>
  );
};
