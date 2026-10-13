import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { loadMirrorDocsTitles } from '../lib/mirrorz-docs/loader';

export const GET: APIRoute = async () => {
  const titles = await loadMirrorDocsTitles();
  const specialPages = (await getCollection('specialPages'))
    .filter((entry) => entry.id.startsWith('zh/'))
    .map((entry) => [entry.id.slice(3).replace(/\.mdx?$/, ''), entry.data.title] as const)
    .sort(([a], [b]) => a.localeCompare(b, 'en'));
  const lines = [
    '# 浙江大学开源软件镜像站',
    '',
    '- `/docs/<id>/` 为 HTML 帮助页面，`/docs/<id>.md` 为使用默认选项的 Markdown。',
    '- Markdown 开头列出镜像地址与选项。页面上的“复制 Markdown”按钮复制同一静态文档。',
    '- 文档覆盖所有共享帮助，文档存在不代表本站提供对应镜像；当前目录、地址与状态请查阅 mirrorz.json。',
    '- 本索引及文档在构建时生成，不包含实时同步状态。',
    '- 文档许可：CC BY-NC-SA 4.0。',
    '',
    '## 当前镜像目录',
    '',
    '- [MirrorZ JSON](https://mirrors.zju.edu.cn/mirrorz.json): 当前镜像目录、服务地址与状态。',
    '',
    '## 使用帮助（中文）',
    '',
    ...Object.entries(titles)
      .sort(([a], [b]) => a.localeCompare(b, 'en'))
      .map(
        ([id, title]) =>
          `- [${title.replace(/[\[\]\\]/g, '\\$&')}](https://mirrors.zju.edu.cn/docs/${encodeURIComponent(id)}.md)`
      ),
    '',
    '## 特殊页面',
    '',
    ...specialPages.map(
      ([id, title]) =>
        `- [${title.replace(/[\[\]\\]/g, '\\$&')}](https://mirrors.zju.edu.cn/${encodeURIComponent(id)}.md)`
    ),
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
