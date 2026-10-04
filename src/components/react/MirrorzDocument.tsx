import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentProps,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import GuideHero from './GuideHero';
import DocumentOptions from './DocumentOptions';

import { copyText, enhanceCodeBlocks } from '../../lib/code-blocks';
import { checkIcon, contentCopyIcon, codeIcon } from '../../lib/ui-icons';
import { highlightCodeElement } from '../../lib/code-highlighting';
import {
  CERNET_MIRROR_ORIGIN,
  isZjuMirrorUrl,
  MIRROR_SERVICE_CHANGE_EVENT,
  type MirrorServiceChangeDetail,
  replaceMirrorOrigin,
} from '../../lib/mirror-endpoint';
import {
  renderTemplateText,
  resolveVariables,
} from '../../lib/mirrorz-docs/render';
import { exportDocumentMarkdown } from '../../lib/mirrorz-docs/markdown';
import type {
  DocumentInput,
  MirrorzDocument as MirrorzDocumentData,
} from '../../lib/mirrorz-docs/types';

interface Props {
  document: MirrorzDocumentData;
  locale?: 'zh' | 'en';
  hero: Omit<ComponentProps<typeof GuideHero>, 'actions' | 'locale'>;
  children?: ReactNode;
}

type InputState = Record<string, boolean | number | string>;

function initialInputState(inputs: DocumentInput[]): InputState {
  return Object.fromEntries(
    inputs.map((input) => {
      if (input.kind === 'select') return [input.name, input.defaultIndex];
      if (input.kind === 'boolean') return [input.name, input.defaultValue];
      return [input.name, input.defaultValue];
    })
  );
}

export default function MirrorzDocument({
  document,
  locale = 'zh',
  hero,
  children,
}: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const [inputState, setInputState] = useState<InputState>(() =>
    initialInputState(document.inputs)
  );
  const [blockStates, setBlockStates] = useState<Record<string, InputState>>(
    () =>
      Object.fromEntries(
        document.controlGroups
          .filter((group) => group.templateId)
          .map((group) => [
            group.templateId!,
            initialInputState(
              document.inputs.filter((input) =>
                group.inputNames.includes(input.name)
              )
            ),
          ])
      )
  );
  const [controlTargets, setControlTargets] = useState<
    Record<string, HTMLElement>
  >({});
  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    setControlTargets(
      Object.fromEntries(
        [...article.querySelectorAll<HTMLElement>('[data-zdoc-controls]')].map(
          (node) => [node.dataset.zdocControls!, node]
        )
      )
    );
  }, [document.html]);
  const [httpsEnabled, setHttpsEnabled] = useState(
    document.requiredScheme !== 'http'
  );
  const [sudoEnabled, setSudoEnabled] = useState(true);
  const [federatedEnabled, setFederatedEnabled] = useState(false);

  const [copyStatus, setCopyStatus] = useState('');
  const [copied, setCopied] = useState(false);
  const copyResetTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyIcon = copied ? checkIcon : contentCopyIcon;
  const copyLabel = copied
    ? locale === 'zh'
      ? '已复制'
      : 'Copied'
    : locale === 'zh'
      ? '复制全文'
      : 'Copy page';
  const [copyFallback, setCopyFallback] = useState<string | null>(null);

  useEffect(
    () => () => {
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
    },
    []
  );
  const options = useMemo(
    () => ({
      https: httpsEnabled,
      sudo: sudoEnabled,
      federated: federatedEnabled,
    }),
    [httpsEnabled, sudoEnabled, federatedEnabled]
  );

  async function copyPage() {
    const markdown = exportDocumentMarkdown(
      document,
      inputState,
      options,
      true,
      blockStates
    );
    try {
      await copyText(markdown);
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
      setCopied(true);
      copyResetTimer.current = setTimeout(() => {
        setCopied(false);
        setCopyStatus('');
        copyResetTimer.current = null;
      }, 2000);
      setCopyFallback(null);
      setCopyStatus(locale === 'zh' ? '已复制' : 'Copied');
    } catch {
      if (copyResetTimer.current !== null) clearTimeout(copyResetTimer.current);
      copyResetTimer.current = null;
      setCopied(false);
      setCopyFallback(markdown);
      setCopyStatus(
        locale === 'zh'
          ? '请选择下方文本并复制'
          : 'Select and copy the text below'
      );
    }
  }

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    for (const template of document.templates) {
      const target = article.querySelector<HTMLElement>(
        `[data-zdoc-template="${template.id}"]`
      );
      if (target) {
        target.textContent = renderTemplateText(
          template.source,
          resolveVariables(
            document,
            { ...inputState, ...blockStates[template.id] },
            options,
            template.inputNames
          )
        );
        highlightCodeElement(target);
      }
    }
  }, [document, inputState, blockStates, options]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    return enhanceCodeBlocks(article, locale);
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
      <GuideHero
        {...hero}
        locale={locale}
        actions={
          <div className="guide-export">
            <div className="guide-export-actions">
              <button
                type="button"
                className="guide-export-icon"
                onClick={copyPage}
                aria-label={copyLabel}
                aria-describedby="guide-copy-hint"
              >
                <svg
                  viewBox={`0 0 ${copyIcon.width} ${copyIcon.height}`}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: copyIcon.body }}
                />
                <span
                  className="site-action-label"
                  id="guide-copy-hint"
                  role="tooltip"
                >
                  {copyLabel}
                </span>
              </button>
              <a
                className="guide-export-icon"
                href={`/docs/${encodeURIComponent(document.routeId)}.md`}
                aria-label={
                  locale === 'zh' ? '查看 Markdown' : 'View as Markdown'
                }
                aria-describedby="guide-markdown-hint"
              >
                <svg
                  viewBox={`0 0 ${codeIcon.width} ${codeIcon.height}`}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: codeIcon.body }}
                />
                <span
                  className="site-action-label"
                  id="guide-markdown-hint"
                  role="tooltip"
                >
                  {locale === 'zh' ? '查看 Markdown' : 'View as Markdown'}
                </span>
              </a>
            </div>
            <span
              className={
                copyFallback === null ? 'visually-hidden' : 'guide-copy-status'
              }
              role="status"
            >
              {copyStatus}
            </span>
          </div>
        }
      />
      <section className="article-body guide-body">
        {locale === 'en' && (
          <p className="guide-note">
            This shared guide is currently available only in Chinese. Use the
            controls below to select the mirror endpoint and command options.
          </p>
        )}
        {copyFallback !== null && (
          <div className="guide-export-fallback">
            <textarea
              autoFocus
              readOnly
              value={copyFallback}
              onFocus={(event) => event.currentTarget.select()}
              aria-label={
                locale === 'zh' ? '待复制的 Markdown 全文' : 'Markdown to copy'
              }
            />
            <button type="button" onClick={() => setCopyFallback(null)}>
              {locale === 'zh' ? '关闭' : 'Close'}
            </button>
          </div>
        )}
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
        </form>
        <article
          ref={articleRef}
          lang="zh"
          className="prose mirrorz-document"
          dangerouslySetInnerHTML={{ __html: document.html }}
        />
        {document.controlGroups.map((group) => {
          const target = controlTargets[group.id];
          if (!target) return null;
          return createPortal(
            <DocumentOptions
              id={group.id}
              inputs={group.inputNames.map(
                (name) => document.inputs.find((input) => input.name === name)!
              )}
              state={
                group.templateId ? blockStates[group.templateId] : inputState
              }
              locale={locale}
              onChange={(name, value) => {
                if (group.templateId) {
                  setBlockStates((current) => ({
                    ...current,
                    [group.templateId!]: {
                      ...current[group.templateId!],
                      [name]: value,
                    },
                  }));
                } else {
                  setInputState((current) => ({ ...current, [name]: value }));
                }
              }}
            />,
            target,
            group.id
          );
        })}
        {children}
      </section>
    </>
  );
}
