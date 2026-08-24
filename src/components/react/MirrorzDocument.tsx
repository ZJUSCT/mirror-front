import { useEffect, useMemo, useRef, useState } from 'react';

import { renderTemplateText } from '../../lib/mirrorz-docs/render';
import type {
  DocumentInput,
  MirrorzDocument as MirrorzDocumentData,
  TemplateVariables,
} from '../../lib/mirrorz-docs/types';

interface Props {
  document: MirrorzDocumentData;
  locale?: 'zh' | 'en';
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

export default function MirrorzDocument({ document, locale = 'zh' }: Props) {
  const articleRef = useRef<HTMLElement>(null);
  const [inputState, setInputState] = useState<InputState>(() =>
    initialInputState(document.inputs)
  );
  const [httpsEnabled, setHttpsEnabled] = useState(
    document.requiredScheme !== 'http'
  );
  const [sudoEnabled, setSudoEnabled] = useState(true);

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
    result.endpoint = endpoint.toString().replace(/\/$/, '');
    result.scheme = httpsEnabled ? 'https' : 'http';
    result.http_protocol = httpsEnabled ? 'https://' : 'http://';
    result.sudo = sudoEnabled ? 'sudo ' : '';
    result.sudoE = sudoEnabled ? 'sudo -E ' : '';
    return result;
  }, [document, httpsEnabled, inputState, sudoEnabled]);

  useEffect(() => {
    const article = articleRef.current;
    if (!article) return;
    for (const template of document.templates) {
      const target = article.querySelector<HTMLElement>(
        `[data-zdoc-template="${template.id}"]`
      );
      if (target)
        target.textContent = renderTemplateText(template.source, variables);
    }
  }, [document.templates, variables]);

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
        lang="zh"
        className="prose mirrorz-document"
        dangerouslySetInnerHTML={{ __html: document.html }}
      />
    </>
  );
}
