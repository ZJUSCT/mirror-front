import { useTheme } from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Divider from '@mui/material/Divider';
import Paper from '@mui/material/Paper';
import MuiTable from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import React, { memo } from 'react';
import { Components as MDXComponents } from '@mdx-js/react/lib';
import { LinkLink as Link } from '~/components/link-mui-components';
import CodeBlock from '../components/code-block';

type GenericMemoExoticComponent = React.MemoExoticComponent<
  (props: any) => React.JSX.Element
>;

const components: MDXComponents = {
  p: (() => {
    const Paragraph = (props: any) => (
      <Typography {...props} style={{ margin: '8px 0' }} />
    );
    return memo(Paragraph);
  })(),
  h1: (() => {
    const H1 = (props: any) => (
      <Typography
        {...props}
        component="h1"
        variant="h3"
        style={{ margin: '24px 0 8px' }}
      />
    );
    return memo(H1);
  })(),
  h2: (() => {
    const H2 = (props: any) => (
      <Typography
        {...props}
        component="h2"
        variant="h4"
        style={{ margin: '24px 0 8px' }}
      />
    );
    return memo(H2);
  })(),
  h3: (() => {
    const H3 = (props: any) => (
      <Typography
        {...props}
        component="h3"
        variant="h5"
        style={{ margin: '24px 0 8px' }}
      />
    );
    return memo(H3);
  })(),
  h4: (() => {
    const H4 = (props: any) => (
      <Typography
        {...props}
        component="h4"
        variant="h6"
        style={{ margin: '16px 0 8px' }}
      />
    );
    return memo(H4);
  })(),
  h5: (() => {
    const H5 = (props: any) => (
      <Typography
        {...props}
        component="h5"
        variant="subtitle2"
        style={{ margin: '16px 0 8px' }}
      />
    );
    return memo(H5);
  })(),
  h6: (() => {
    const H6 = (props: any) => (
      <Typography {...props} component="h6" variant="body1" />
    );
    return memo(H6);
  })(),
  blockquote: (() => {
    const Blockquote = (props: any) => {
      const theme = useTheme();
      return (
        <Paper
          style={{
            borderLeft: `5px solid ${theme.palette.primary.light}`,
            padding: '4px 24px',
            margin: '16px 0',
          }}
          {...props}
        />
      );
    };
    return memo(Blockquote);
  })(),
  ul: (() => {
    const Ul = (props: any) => (
      <Typography {...props} component="ul" style={{ paddingLeft: 30 }} />
    );
    return memo(Ul);
  })(),
  ol: (() => {
    const Ol = (props: any) => (
      <Typography
        {...props}
        component="ol"
        style={{ marginTop: 0, marginBottom: 16 }}
      />
    );
    return memo(Ol);
  })(),
  li: (() => {
    const Li = (props: any) => <Typography {...props} component="li" />;
    return memo(Li);
  })(),
  table: (() => {
    const Table = (props: any) => <MuiTable {...props} />;
    return memo(Table);
  })(),
  tr: (() => {
    const Tr = (props: any) => <TableRow {...props} />;
    return memo(Tr);
  })(),
  td: (() => {
    const Td = ({
      align,
      ...props
    }: {
      align?: TableCellProps['align'];
      [key: string]: any;
    }) => <TableCell align={align || undefined} {...props} />;
    return memo(Td) as GenericMemoExoticComponent;
  })(),
  tbody: (() => {
    const TBody = (props: any) => <TableBody {...props} />;
    return memo(TBody);
  })(),
  th: (() => {
    const Th = ({
      align,
      ...props
    }: {
      align?: TableCellProps['align'];
      [key: string]: any;
    }) => <TableCell align={align || undefined} {...props} />;
    return memo(Th) as GenericMemoExoticComponent;
  })(),
  thead: (() => {
    const THead = (props: any) => <TableHead {...props} />;
    return memo(THead);
  })(),
  code: (() => {
    const CodeBlk = ({
      children,
      className,
    }: {
      children: string;
      className?: string;
    }) => {
      if (className === undefined) {
        const theme = useTheme();
        return (
          <Typography
            component="code"
            style={{ color: theme.palette.secondary.main }}
          >
            {children}
          </Typography>
        );
      }
      const lang = className?.match(/language-(?<lang>.*)/)?.groups?.lang || '';
      return <CodeBlock language={lang}>{children}</CodeBlock>;
    };
    return memo(CodeBlk) as GenericMemoExoticComponent;
  })(),
  hr: () => {
    return <Divider />;
  },
  input: (() => {
    const Input = (props: any) => {
      const { type } = props;
      if (type === 'checkbox') {
        return <Checkbox {...props} disabled={false} readOnly />;
      }
      return <input {...props} />;
    };
    return memo(Input);
  })(),
  wrapper: (() => {
    const Wrapper = (props: any) => (
      <div {...props} className="markdown-body" />
    );
    return memo(Wrapper);
  })(),
  a: (() => {
    const ALink = (props: any) => <Link {...props} />;
    return memo(ALink);
  })(),
};

export default components;
