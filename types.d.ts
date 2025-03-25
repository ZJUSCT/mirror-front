declare module '*.svg' {
  import { FC, SVGProps } from 'react';

  export const ReactComponent: FC<SVGProps<SVGElement>>;
}

declare module 'gatsby-theme-material-ui-top-layout/src/components/viewport' {
  const content: any;
  export default content;
}
