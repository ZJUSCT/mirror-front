import { marked, type Token } from 'marked';
import {
  CERNET_MIRROR_ORIGIN,
  isZjuMirrorUrl,
  replaceMirrorOrigin,
  ZJU_MIRROR_ORIGIN,
} from '../mirror-endpoint';
import {
  renderTemplateText,
  resolveVariables,
  templateToken,
  type GuideOptions,
  type InputState,
} from './render';
import type { DocumentInput, MirrorzDocument } from './types';

function codeSpan(text: string): string {
  const fence = '`'.repeat(
    Math.max(0, ...Array.from(text.matchAll(/`+/g), (m) => m[0].length)) + 1
  );
  const padding = text.startsWith('`') || text.endsWith('`') ? ' ' : '';
  return `${fence}${padding}${text}${padding}${fence}`;
}

// Work on Markdown tokens, leaving code examples untouched.
export function absoluteMarkdownLinks(
  markdown: string,
  canonical: string,
  federated = false
): string {
  function url(href: string): string {
    const absolute = new URL(href, canonical).toString();
    return federated &&
      isZjuMirrorUrl(absolute) &&
      !new URL(absolute).pathname.startsWith('/docs/')
      ? replaceMirrorOrigin(absolute, CERNET_MIRROR_ORIGIN)
      : absolute;
  }
  function replaceChildren(raw: string, children: Token[]): string {
    let cursor = 0;
    let result = '';
    for (const child of children) {
      const index = raw.indexOf(child.raw, cursor);
      if (index < 0) continue;
      result += raw.slice(cursor, index) + transform(child);
      cursor = index + child.raw.length;
    }
    return result + raw.slice(cursor);
  }
  function transform(token: Token): string {
    if (token.type === 'code' || token.type === 'codespan') return token.raw;
    if (token.type === 'link' || token.type === 'image') {
      const label =
        'tokens' in token && token.tokens
          ? replaceChildren(token.text, token.tokens)
          : token.text;
      return `${token.type === 'image' ? '!' : ''}[${label}](<${url(token.href)}>${token.title ? ` ${JSON.stringify(token.title)}` : ''})`;
    }
    if (token.type === 'def')
      return `[${token.tag}]: <${url(token.href)}>${token.title ? ` ${JSON.stringify(token.title)}` : ''}\n`;
    if (token.type === 'list') return replaceChildren(token.raw, token.items);
    if (token.type === 'table')
      return replaceChildren(
        token.raw,
        [...token.header, ...token.rows.flat()].flatMap((cell) => cell.tokens)
      );
    if ('tokens' in token && token.tokens)
      return replaceChildren(token.raw, token.tokens);
    return token.raw;
  }
  return marked.lexer(markdown).map(transform).join('');
}

function inputValue(input: DocumentInput, state: InputState): string {
  const selected = state[input.name];
  if (input.kind === 'select') {
    return input.choices[
      typeof selected === 'number' ? selected : input.defaultIndex
    ]?.label ?? '（未选择）';
  }
  if (input.kind === 'boolean') {
    return (selected ?? input.defaultValue) ? '开启' : '关闭';
  }
  return String(selected ?? input.defaultValue) || '（未填写）';
}

function describeOptions(
  inputs: DocumentInput[],
  state: InputState,
  endpoint: string,
  sudo: boolean
): string[] {
  const lines = [
    '> 可调整选项：',
    `> - 镜像地址：${codeSpan(endpoint)}`,
    `> - sudo：${codeSpan(sudo ? '开启' : '关闭')}`,
  ];
  for (const input of inputs) {
    lines.push(`> - ${input.title} (${input.name})：${codeSpan(inputValue(input, state))}`);
    if (input.kind === 'select') {
      lines.push('>   - 可选值：');
      for (const choice of input.choices) {
        lines.push(`>     - ${codeSpan(choice.label)}`);
      }
    } else if (input.kind === 'boolean') {
      lines.push('>   - 可选值：`开启`、`关闭`');
    }
  }
  return lines;
}

export function exportDocumentMarkdown(
  document: MirrorzDocument,
  state: InputState = {},
  options: GuideOptions = {},
  _current = false,
  blockStates: Record<string, InputState> = {}
): string {
  const canonical = `${ZJU_MIRROR_ORIGIN}/docs/${encodeURIComponent(document.routeId)}/`;
  const variables = resolveVariables(document, state, options);
  let body = absoluteMarkdownLinks(
    document.markdown,
    canonical,
    options.federated
  );
  body = body.replace(/^(#{1,6} .+?)\s+\{#[\w.:-]+\}\s*$/gm, '$1');
  for (const template of document.templates) {
    const local = resolveVariables(
      document,
      { ...state, ...blockStates[template.id] },
      options,
      template.inputNames
    );
    const content = renderTemplateText(template.source, local);
    const token = templateToken(template);
    if (template.inline) {
      body = body.replaceAll(token, codeSpan(content));
    } else {
      const fence = '`'.repeat(
        Math.max(
          2,
          ...Array.from(content.matchAll(/`+/g), (m) => m[0].length)
        ) + 1
      );
      const caption = template.filepath
        ? `${template.append ? '追加到' : '写入'} ${codeSpan(renderTemplateText(template.filepath, local))}：\n\n`
        : '';
      const rendered = `${caption}${fence}${template.language ?? ''}\n${content}\n${fence}`;
      body = body.replace(
        new RegExp(`^( *)${token}`, 'gm'),
        (_whole, indent: string) =>
          rendered
            .split('\n')
            .map((line) => indent + line)
            .join('\n')
      );
    }
  }
  const sudo = options.sudo !== false;
  return [
    `# ${document.title}`,
    '',
    ...describeOptions(document.inputs, state, String(variables.endpoint), sudo),
    '',
    '',
    '> 本站收录所有共享帮助文档；文档存在不代表浙江大学镜像站当前提供该镜像。请查阅 https://mirrors.zju.edu.cn/mirrorz.json 确认当前目录与状态。',
    '> 下列命令使用上述选项，请根据实际系统版本选择；未填写的文本选项需要在原文页面补充。',
    '',
    body.trim(),
    '',
    '---',
    '',
    '许可：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)',
    '文档索引：https://mirrors.zju.edu.cn/llms.txt',
    ...(options.federated
      ? ['如仅限浙大校内网络访问，可将 mirrors.cernet.edu.cn 替换为 mirrors.zju.edu.cn。']
      : []),
    '',
  ].join('\n');
}
