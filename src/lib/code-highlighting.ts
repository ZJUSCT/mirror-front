import hljs from 'highlight.js/lib/core';
import bash from 'highlight.js/lib/languages/bash';
import c from 'highlight.js/lib/languages/c';
import clojure from 'highlight.js/lib/languages/clojure';
import dos from 'highlight.js/lib/languages/dos';
import gradle from 'highlight.js/lib/languages/gradle';
import ini from 'highlight.js/lib/languages/ini';
import json from 'highlight.js/lib/languages/json';
import julia from 'highlight.js/lib/languages/julia';
import markdown from 'highlight.js/lib/languages/markdown';
import nix from 'highlight.js/lib/languages/nix';
import perl from 'highlight.js/lib/languages/perl';
import plaintext from 'highlight.js/lib/languages/plaintext';
import powershell from 'highlight.js/lib/languages/powershell';
import properties from 'highlight.js/lib/languages/properties';
import r from 'highlight.js/lib/languages/r';
import scheme from 'highlight.js/lib/languages/scheme';
import toml from 'highlight.js/lib/languages/ini';
import xml from 'highlight.js/lib/languages/xml';
import yaml from 'highlight.js/lib/languages/yaml';

const languages = {
  bash,
  c,
  clojure,
  dos,
  gradle,
  ini,
  json,
  julia,
  markdown,
  nix,
  perl,
  plaintext,
  powershell,
  properties,
  r,
  scheme,
  toml,
  xml,
  yaml,
};

for (const [name, language] of Object.entries(languages)) {
  hljs.registerLanguage(name, language);
}

const languageAliases: Record<string, keyof typeof languages> = {
  conf: 'ini',
  console: 'bash',
  html: 'xml',
  md: 'markdown',
  ps1: 'powershell',
  shell: 'bash',
  sh: 'bash',
  text: 'plaintext',
  txt: 'plaintext',
};

export function normalizeCodeLanguage(
  language: string | null | undefined
): keyof typeof languages | null {
  const normalized = language?.trim().toLowerCase();
  if (!normalized) return null;
  const canonical = languageAliases[normalized] ?? normalized;
  return Object.hasOwn(languages, canonical)
    ? (canonical as keyof typeof languages)
    : null;
}

export function languageFromCodeElement(element: HTMLElement): string | null {
  if (element.dataset.language) return element.dataset.language;
  const languageClass = [...element.classList].find((name) =>
    name.startsWith('language-')
  );
  return languageClass?.slice('language-'.length) ?? null;
}

export function highlightCode(
  source: string,
  language: string | null | undefined
): { html: string; language: string } | null {
  const normalized = normalizeCodeLanguage(language);
  if (!normalized) return null;
  const result = hljs.highlight(source, {
    language: normalized,
    ignoreIllegals: true,
  });
  return { html: result.value, language: normalized };
}

export function highlightCodeElement(element: HTMLElement): string | null {
  const source = element.textContent ?? '';
  const result = highlightCode(source, languageFromCodeElement(element));
  element.classList.add('hljs');
  if (result) {
    // highlight.js escapes source text before adding its own bounded span set.
    element.innerHTML = result.html;
    return result.language;
  }
  element.textContent = source;
  return null;
}
