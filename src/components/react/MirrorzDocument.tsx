import { useEffect, useMemo, useRef, useState } from 'react';

import {
  highlightCodeElement,
  languageFromCodeElement,
} from '../../lib/code-highlighting';
import {
  CERNET_MIRROR_ORIGIN,
  isZjuMirrorUrl,
  MIRROR_SERVICE_CHANGE_EVENT,
  type MirrorServiceChangeDetail,
  replaceMirrorOrigin,
  ZJU_MIRROR_ORIGIN,
} from '../../lib/mirror-endpoint';
import { renderTemplateText } from '../../lib/mirrorz-docs/render';
import type {
  DocumentInput,
  MirrorzDocument as MirrorzDocumentData,
  TemplateVariables,
} from '../../lib/mirrorz-docs/types';
import { contentCopyIcon } from '../../lib/ui-icons';

interface Props {
  document: MirrorzDocumentData;
  locale?: 'zh' | 'en';
}

type InputState = Record<string, boolean | number | string>;

interface CopyLabels {
  copy: string;
  copied: string;
  failed: string;
  code: string;
}

const copyLabels: Record<'zh' | 'en', CopyLabels> = {
  zh: {
    copy: '复制',
    copied: '已复制',
    failed: '复制失败',
    code: '代码',
  },
  en: {
    copy: 'Copy',
    copied: 'Copied',
    failed: 'Copy failed',
    code: 'Code',
  },
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

function initialInputState(inputs: DocumentInput[]): InputState {
  return Object.fromEntries(
    inputs.map((input) => {
      if (input.kind === 'select') return [input.name, input.defaultIndex];
      if (input.kind === 'boolean') return [input.name, input.defaultValue];
      return [input.name, input.defaultValue];
    })
  );
}

export default function MirrorzDocument({ document, locale = 'zh' }: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const [inputState, setInputState] = useState<InputState>(() =>
    initialInputState(document.inputs)
  );
  const [httpsEnabled, setHttpsEnabled] = useState(
    document.requiredScheme !== 'http'
  );
  const [sudoEnabled, setSudoEnabled] = useState(true);
  const [federatedEnabled, setFederatedEnabled] = useState(false);

  const variables = useMemo(() => {
    const result: TemplateVariables = { ...document.initialVariables };
    for (const input of document.inputs) {
      const value = inputState[input.name];
      if (input.kind === 'select') {
        Object.assign(
          result,
          input.choices[typeof value === 'number' ? value : 0]?.values ?? {}
        );
      } else if (input.kind === 'boolean') {
        result[input.name] = value ? input.trueValue : input.falseValue;
      } else {
        result[input.name] = typeof value === 'string' ? value : '';
      }
    }

    const endpoint = new URL(String(result.endpoint));
    endpoint.protocol = httpsEnabled ? 'https:' : 'http:';
    endpoint.host = new URL(
      federatedEnabled ? CERNET_MIRROR_ORIGIN : ZJU_MIRROR_ORIGIN
    ).host;
    result.endpoint = endpoint.toString().replace(/\/$/, '');
    result.host = endpoint.host;
    result.mirror = `${endpoint.host}${endpoint.pathname}`;
    result.path = endpoint.pathname;
    result.scheme = httpsEnabled ? 'https' : 'http';
    result.http_protocol = httpsEnabled ? 'https://' : 'http://';
    result.sudo = sudoEnabled ? 'sudo ' : '';
    result.sudoE = sudoEnabled ? 'sudo -E ' : '';
    return result;
  }, [document, federatedEnabled, httpsEnabled, inputState, sudoEnabled]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    for (const template of document.templates) {
      const target = article.querySelector<HTMLElement>(
        `[data-zdoc-template="${template.id}"]`
      );
      if (target) {
        target.textContent = renderTemplateText(template.source, variables);
        highlightCodeElement(target);
      }
    }
  }, [document.templates, variables]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    const labels = copyLabels[locale];
    const cleanups: Array<() => void> = [];

    for (const code of article.querySelectorAll<HTMLElement>('pre > code')) {
      const pre = code.parentElement;
      if (!(pre instanceof HTMLPreElement)) continue;
      pre.tabIndex = 0;

      let shell: HTMLElement;
      if (pre.parentElement?.classList.contains('zdoc-template')) {
        shell = pre.parentElement;
      } else {
        shell = globalThis.document.createElement('figure');
        pre.before(shell);
        shell.append(pre);
      }
      shell.classList.add('code-block-shell');

      const declaredLanguage = languageFromCodeElement(code);
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
        if (resetTimer) clearTimeout(resetTimer);
      });
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [document.html, locale]);

  useEffect(() => {
    const article = articleRef.current;
    if (article) {
      for (const link of article.querySelectorAll<HTMLAnchorElement>(
        'a[href]'
      )) {
        const originalHref = link.dataset.zjuMirrorHref ?? link.href;
        let originalUrl: URL;
        try {
          originalUrl = new URL(originalHref);
        } catch {
          continue;
        }
        if (!isZjuMirrorUrl(originalUrl.toString())) continue;
        link.dataset.zjuMirrorHref = originalUrl.toString();
        link.href = federatedEnabled
          ? replaceMirrorOrigin(originalUrl.toString(), CERNET_MIRROR_ORIGIN)
          : originalUrl.toString();
      }
    }

    globalThis.document.documentElement.dataset.mirrorService = federatedEnabled
      ? 'cernet'
      : 'zju';
    window.dispatchEvent(
      new CustomEvent<MirrorServiceChangeDetail>(MIRROR_SERVICE_CHANGE_EVENT, {
        detail: { federated: federatedEnabled },
      })
    );
  }, [federatedEnabled]);

  return (
    <>
      <form
        className="docs-controls"
        onSubmit={(event) => event.preventDefault()}
      >
        <fieldset>
          <legend>{locale === 'zh' ? '通用选项' : 'General options'}</legend>
          <label>
            <input
              id="mirrorz-use-federated"
              name="use-federated"
              type="checkbox"
              checked={federatedEnabled}
              onChange={(event) => setFederatedEnabled(event.target.checked)}
            />
            {locale === 'zh'
              ? '使用教育网联合镜像站'
              : 'Use the CERNET federated mirror'}
          </label>
          <label>
            <input
              id="mirrorz-use-https"
              name="use-https"
              type="checkbox"
              checked={httpsEnabled}
              disabled={document.requiredScheme !== null}
              onChange={(event) => setHttpsEnabled(event.target.checked)}
            />
            {document.requiredScheme
              ? locale === 'zh'
                ? `本文档要求使用 ${document.requiredScheme.toUpperCase()}`
                : `This guide requires ${document.requiredScheme.toUpperCase()}`
              : locale === 'zh'
                ? '使用 HTTPS'
                : 'Use HTTPS'}
          </label>
          <label>
            <input
              id="mirrorz-include-sudo"
              name="include-sudo"
              type="checkbox"
              checked={sudoEnabled}
              onChange={(event) => setSudoEnabled(event.target.checked)}
            />
            {locale === 'zh' ? '命令包含 sudo' : 'Include sudo in commands'}
          </label>
        </fieldset>
        {document.inputs.length ? (
          <fieldset>
            <legend>{locale === 'zh' ? '文档选项' : 'Guide options'}</legend>
            {document.inputs.map((input) => {
              if (input.kind === 'select') {
                return (
                  <label key={input.name}>
                    <span>{input.title}</span>
                    <select
                      id={`mirrorz-input-${input.name}`}
                      name={input.name}
                      value={Number(inputState[input.name])}
                      onChange={(event) =>
                        setInputState((current) => ({
                          ...current,
                          [input.name]: Number(event.target.value),
                        }))
                      }
                    >
                      {input.choices.map((choice, index) => (
                        <option
                          key={`${input.name}-${choice.label}`}
                          value={index}
                        >
                          {choice.label}
                        </option>
                      ))}
                    </select>
                    {input.note ? <small>{input.note}</small> : null}
                  </label>
                );
              }
              if (input.kind === 'boolean') {
                return (
                  <label key={input.name}>
                    <input
                      id={`mirrorz-input-${input.name}`}
                      name={input.name}
                      type="checkbox"
                      checked={Boolean(inputState[input.name])}
                      onChange={(event) =>
                        setInputState((current) => ({
                          ...current,
                          [input.name]: event.target.checked,
                        }))
                      }
                    />
                    {input.title}
                    {input.note ? <small>{input.note}</small> : null}
                  </label>
                );
              }
              return (
                <label key={input.name}>
                  <span>{input.title}</span>
                  <input
                    id={`mirrorz-input-${input.name}`}
                    name={input.name}
                    type="text"
                    value={String(inputState[input.name] ?? '')}
                    onChange={(event) =>
                      setInputState((current) => ({
                        ...current,
                        [input.name]: event.target.value,
                      }))
                    }
                  />
                  {input.note ? <small>{input.note}</small> : null}
                </label>
              );
            })}
          </fieldset>
        ) : null}
      </form>
      <article
        ref={articleRef}
        lang={locale}
        className="prose mirrorz-document"
        dangerouslySetInnerHTML={{ __html: document.html }}
      />
    </>
  );
}
