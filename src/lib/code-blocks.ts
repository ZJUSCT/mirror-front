import {
  highlightCodeElement,
  languageFromCodeElement,
} from './code-highlighting';
import { contentCopyIcon } from './ui-icons';

interface CopyLabels {
  copy: string;
  copied: string;
  failed: string;
  code: string;
}

const copyLabels: Record<'zh' | 'en', CopyLabels> = {
  zh: { copy: '复制', copied: '已复制', failed: '复制失败', code: '代码' },
  en: { copy: 'Copy', copied: 'Copied', failed: 'Copy failed', code: 'Code' },
};

async function copyText(value: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = value;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const legacyDocument = document as unknown as {
    execCommand(commandId: string): boolean;
  };
  const copied = legacyDocument.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('copy command was rejected');
}

function createCopyButton(labels: CopyLabels): HTMLButtonElement {
  const button = document.createElement('button');
  button.className = 'code-copy-button';
  button.type = 'button';
  button.title = labels.copy;
  button.setAttribute('aria-label', labels.copy);
  button.innerHTML = `<svg viewBox="0 0 ${contentCopyIcon.width} ${contentCopyIcon.height}" aria-hidden="true">${contentCopyIcon.body}</svg><span aria-live="polite"></span>`;
  const label = button.querySelector('span');
  if (label) label.textContent = labels.copy;
  return button;
}

export function enhanceCodeBlocks(
  container: ParentNode,
  locale: 'zh' | 'en'
): () => void {
  const labels = copyLabels[locale];
  const cleanups: Array<() => void> = [];

  for (const code of container.querySelectorAll<HTMLElement>('pre > code')) {
    const pre = code.parentElement;
    if (!(pre instanceof HTMLPreElement)) continue;
    pre.tabIndex = 0;
    pre.classList.remove('astro-code', 'github-dark');
    pre.removeAttribute('style');

    let shell: HTMLElement;
    if (
      pre.parentElement?.classList.contains('zdoc-template') ||
      pre.parentElement?.classList.contains('code-block-shell')
    ) {
      shell = pre.parentElement;
    } else {
      shell = globalThis.document.createElement('figure');
      pre.before(shell);
      shell.append(pre);
    }
    shell.classList.add('code-block-shell');

    const declaredLanguage =
      languageFromCodeElement(code) ?? pre.dataset.language ?? null;
    if (declaredLanguage) code.dataset.language = declaredLanguage;
    const highlightedLanguage = highlightCodeElement(code);
    let caption = shell.querySelector<HTMLElement>(':scope > figcaption');
    if (!caption) {
      caption = globalThis.document.createElement('figcaption');
      caption.className = 'code-block-language';
      shell.prepend(caption);
    }
    if (!caption.textContent?.trim()) {
      caption.textContent =
        highlightedLanguage ?? declaredLanguage ?? labels.code;
    }

    const existingButton = shell.querySelector(':scope > .code-copy-button');
    existingButton?.remove();
    const button = createCopyButton(labels);
    let resetTimer: ReturnType<typeof setTimeout> | undefined;
    const setFeedback = (message: string) => {
      const label = button.querySelector('span');
      if (label) label.textContent = message;
      button.setAttribute('aria-label', message);
      if (resetTimer) clearTimeout(resetTimer);
      resetTimer = setTimeout(() => {
        if (label) label.textContent = labels.copy;
        button.setAttribute('aria-label', labels.copy);
      }, 1800);
    };
    const handleCopy = async () => {
      try {
        await copyText(code.textContent ?? '');
        setFeedback(labels.copied);
      } catch {
        setFeedback(labels.failed);
      }
    };
    button.addEventListener('click', handleCopy);
    shell.insertBefore(button, pre);
    cleanups.push(() => {
      button.removeEventListener('click', handleCopy);
      button.remove();
      if (resetTimer) clearTimeout(resetTimer);
    });
  }

  return () => cleanups.forEach((cleanup) => cleanup());
}
