import { useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { Link } from "gatsby-theme-material-ui";
import React, { memo } from 'react';
import CodeBlock from '../components/code-block';

const components = {
  p: (() => {
    const Paragraph = props => <Typography {...props} style={{ margin: '8px 0' }} />;
    return memo(Paragraph);
  })(),
  h1: (() => {
    const H1 = props => <Typography {...props} component="h1" variant="h3" style={{ margin: '24px 0 8px' }} />;
    return memo(H1);
  })(),
  h2: (() => {
    const H2 = props => <Typography {...props} component="h2" variant="h4" style={{ margin: '24px 0 8px' }} />;
    return memo(H2);
  })(),
  h3: (() => {
    const H3 = props => <Typography {...props} component="h3" variant="h5" style={{ margin: '24px 0 8px' }} />;
    return memo(H3);
  })(),
  h4: (() => {
    const H4 = props => <Typography {...props} component="h4" variant="h6" style={{ margin: '16px 0 8px' }} />;
    return memo(H4);
  })(),
  h5: (() => {
    const H5 = props => <Typography {...props} component="h5" variant="subtitle2" style={{ margin: '16px 0 8px' }} />;
    return memo(H5);
  })(),
  h6: (() => {
    const H6 = props => <Typography {...props} component="h6" variant="body1" />;
    return memo(H6);
  })(),
  blockquote: (() => {
    const Blockquote = props => {
      const theme = useTheme();
      return (
        <Paper style={{ borderLeft: `5px solid ${theme.palette.primary.light}`, padding: '4px 24px', margin: '16px 0' }} {...props} />
      )
    };
    return memo(Blockquote);
  })(),
  ul: (() => {
    const Ul = props => <Typography {...props} component="ul" style={{ paddingLeft: 30 }} />;
    return memo(Ul);
  })(),
  ol: (() => {
    const Ol = props => <Typography {...props} component="ol" style={{ marginTop: 0, marginBottom: 16 }} />;
    return memo(Ol);
  })(),
  li: (() => {
    const Li = props => <Typography {...props} component="li" />;
    return memo(Li);
  })(),
  table: (() => {
    const Table = props => <MuiTable {...props} />;
    return memo(Table);
  })(),
  tr: (() => {
    const Tr = props => <TableRow {...props} />;
    return memo(Tr);
  })(),
  td: (() => {
    const Td = ({ align, ...props }) => (
      <TableCell align={align || undefined} {...props} />
    );
    return memo(Td);
  })(),
  tbody: (() => {
    const TBody = props => <TableBody {...props} />;
    return memo(TBody);
  })(),
  th: (() => {
    const Th = ({ align, ...props }) => (
      <TableCell align={align || undefined} {...props} />
    );
    return memo(Th);
  })(),
  thead: (() => {
    const THead = props => <TableHead {...props} />;
    return memo(THead);
  })(),
  code: (() => {
    const CodeBlk = ({ children, className }) => {
      const lang = className?.match(/language-(?<lang>.*)/)?.groups?.lang || '';
      return <CodeBlock language={lang}>{children}</CodeBlock>;
    };
    return memo(CodeBlk);
  })(),
  inlineCode: (() => {
    const InlineCode = props => {
      const theme = useTheme();
      return (
        <Typography {...props} component="code" style={{ color: theme.palette.secondary.main }} />
      );
    };
    return memo(InlineCode);
  })(),
  hr: Divider,
  input: (() => {
    const Input = props => {
      const { type } = props;
      if (type === 'checkbox') {
        return <Checkbox {...props} disabled={false} readOnly={true} />;
      }
      return <input {...props} />;
    };
    return memo(Input);
  })(),
  wrapper: (() => {
    const Wrapper = props => <div {...props} className="markdown-body" />;
    return memo(Wrapper);
  })(),
  a: (() => {
    const ALink = props => <Link {...props} />;
    return memo(ALink);
  })(),
};

export default components;
