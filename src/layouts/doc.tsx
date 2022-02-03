import * as React from "react";
import '../styles/doc.sass';

export default ({ children }: { children: React.ReactNode }) => (
  <article className="prose dark:prose-invert max-w-none">
    {children}
  </article>
);
