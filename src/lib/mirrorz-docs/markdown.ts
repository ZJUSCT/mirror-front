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
import type { MirrorzDocument } from './types';

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

export function exportDocumentMarkdown(
  document: MirrorzDocument,
  state: InputState = {},
  options: GuideOptions = {},
  current = false
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
      state,
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
  const selections = document.inputs.map((input) => {
    const selected = state[input.name];
    const value =
      input.kind === 'select'
        ? input.choices[
            typeof selected === 'number' ? selected : input.defaultIndex
          ]?.label
        : input.kind === 'boolean'
          ? (selected ?? input.defaultValue)
            ? '开启'
            : '关闭'
          : String(selected ?? input.defaultValue) || '（未填写）';
    return `- ${input.title} (${input.name}): ${codeSpan(String(value))}`;
  });
  return [
    `# ${document.title}`,
    '',
    `原文：${canonical}`,
    '内容语言：zh（中文）',
    `导出选项：${current ? '当前页面选项' : '默认选项；可在原文页面调整选项后复制全文'}`,
    '',
    `- 镜像地址：${codeSpan(String(variables.endpoint))}`,
    `- sudo：${options.sudo === false ? '关闭' : '开启'}`,
    ...selections,
    '',
    '> 本站收录所有共享帮助文档；文档存在不代表浙江大学镜像站当前提供该镜像。请查阅 https://mirrors.zju.edu.cn/mirrorz.json 确认当前目录与状态。',
    '> 下列命令使用上述选项，请根据实际系统版本选择；未填写的文本选项需要在原文页面补充。',
    '',
    body.trim(),
    '',
    '---',
    '',
    `来源：[mirrorz-org/mirrorz-docs](https://github.com/mirrorz-org/mirrorz-docs/tree/${document.sourceCommit}/${encodeURIComponent(document.docsId)})`,
    `源提交：${document.sourceCommit}`,
    '许可：[CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/)',
    '文档索引：https://mirrors.zju.edu.cn/llms.txt',
    '',
  ].join('\n');
}
