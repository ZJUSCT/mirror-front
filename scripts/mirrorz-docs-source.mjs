import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function mirrorzDocsCommit(root = process.cwd()) {
  // CI passes the gitlink SHA to Docker, whose context excludes Git metadata.
  if (process.env.MIRRORZ_DOCS_COMMIT) {
    return process.env.MIRRORZ_DOCS_COMMIT;
  }

  const entry = execFileSync(
    'git',
    ['-C', root, 'ls-files', '--stage', '--', 'vendor/mirrorz-docs'],
    { encoding: 'utf8' }
  ).trim();
  const match = /^160000 ([0-9a-f]{40}) 0\tvendor\/mirrorz-docs$/.exec(entry);
  if (!match) throw new Error('Cannot read the mirrorz-docs gitlink.');
  return match[1];
}

if (path.resolve(process.argv[1] ?? '') === fileURLToPath(import.meta.url)) {
  console.log(mirrorzDocsCommit());
}
