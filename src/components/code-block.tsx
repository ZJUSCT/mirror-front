import Highlight, {
  defaultProps,
  Language,
  PrismTheme,
} from 'prism-react-renderer';
import React from 'react';
import prismDarkTheme from 'prism-react-renderer/themes/dracula';
import prismLightTheme from 'prism-react-renderer/themes/github';
import { useTheme } from '@mui/material';

export interface CodeBlockProps {
  children: string;
  language: Language;
  codeStyle?: React.CSSProperties;
}

export default ({ children, codeStyle, language }: CodeBlockProps) => {
  const theme = useTheme();
  const prismTheme =
    theme.palette.mode === 'light' ? prismLightTheme : prismDarkTheme;

  return (
    <Highlight
      {...defaultProps}
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
  );
};
