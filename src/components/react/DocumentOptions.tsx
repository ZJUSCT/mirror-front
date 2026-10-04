import type { DocumentInput } from '../../lib/mirrorz-docs/types';
import type { InputState } from '../../lib/mirrorz-docs/render';
import { useState } from 'react';
import { infoIcon } from '../../lib/ui-icons';

interface Props {
  id: string;
  inputs: DocumentInput[];
  state: InputState;
  locale: 'zh' | 'en';
  onChange: (name: string, value: string | number | boolean) => void;
}

export default function DocumentOptions({
  id,
  inputs,
  state,
  locale,
  onChange,
}: Props) {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  return (
    <div
      className="docs-controls docs-local-controls"
      role="group"
      aria-label={
        locale === 'zh' ? '此处配置选项' : 'Options for this configuration'
      }
    >
      {inputs.map((input) => {
        const controlId = `${id}-${input.name}`;
        const noteId = `${controlId}-note`;
        const common = {
          id: controlId,
          name: input.name,
          'aria-describedby': input.note ? noteId : undefined,
        };
        return (
          <div className="docs-local-option" key={input.name}>
            <label htmlFor={controlId}>
              {input.kind === 'boolean' ? (
                <input
                  {...common}
                  type="checkbox"
                  checked={Boolean(state[input.name])}
                  onChange={(event) =>
                    onChange(input.name, event.target.checked)
                  }
                />
              ) : null}
              <span>{input.title}</span>
              {input.kind === 'select' ? (
                <select
                  {...common}
                  value={Number(state[input.name])}
                  onChange={(event) =>
                    onChange(input.name, Number(event.target.value))
                  }
                >
                  {input.choices.map((choice, index) => (
                    <option value={index} key={index}>
                      {choice.label}
                    </option>
                  ))}
                </select>
              ) : input.kind === 'text' ? (
                <input
                  {...common}
                  type="text"
                  value={String(state[input.name] ?? '')}
                  onChange={(event) => onChange(input.name, event.target.value)}
                />
              ) : null}
            </label>
            {input.note ? (
              <button
                type="button"
                className="docs-option-help"
                aria-label={
                  locale === 'zh'
                    ? `${input.title}：说明`
                    : `About ${input.title}`
                }
                aria-describedby={noteId}
                onMouseEnter={() => setActiveNote(noteId)}
                onMouseLeave={() => setActiveNote(null)}
                onFocus={() => setActiveNote(noteId)}
                onBlur={() => setActiveNote(null)}
                onClick={() => setActiveNote(noteId)}
                onKeyDown={(event) => {
                  if (event.key === 'Escape') setActiveNote(null);
                }}
              >
                <svg
                  viewBox={`0 0 ${infoIcon.width} ${infoIcon.height}`}
                  aria-hidden="true"
                  dangerouslySetInnerHTML={{ __html: infoIcon.body }}
                />
                <span
                  className="site-action-label docs-option-note"
                  id={noteId}
                  role="tooltip"
                  data-open={activeNote === noteId}
                >
                  {input.note}
                </span>
              </button>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
