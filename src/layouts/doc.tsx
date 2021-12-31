import * as React from "react";
import '../styles/doc.css';

export default ({ children }: { children: React.ReactNode }) => (
  <article className="m-8 prose dark:prose-invert max-w-none">
    {children}
  </article>
);
