import { Highlight, Language, PrismTheme, themes } from 'prism-react-renderer';
import React, { useEffect, useState } from 'react';
import { useTheme } from '@mui/material';
import loadPrismLanguages from '~/utils/prism-languages';

export interface CodeBlockProps {
  children: string;
  language: Language;
  codeStyle?: React.CSSProperties;
}

export default ({ children, codeStyle, language }: CodeBlockProps) => {
  const [_, setLanguageLoaded] = useState(false);
  useEffect(() => {
    (async () => {
      if (await loadPrismLanguages()) {
        setLanguageLoaded(true);
      }
    })();
  }, []);
  const theme = useTheme();
  const prismTheme =
    theme.palette.mode === 'light' ? themes.github : themes.okaidia;

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
                  return <span key={key} {...getTokenProps({ token, key })} />;
                })}
              </div>
            );
          })}
        </code>
      )}
    </Highlight>
  );
};
