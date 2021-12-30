import * as React from "react";

export default ({ children }: { children: React.ReactNode }) => (
  <article className="prose dark:prose-invert max-w-none m-8">
    {children}
  </article>
);
