import type { APIRoute } from 'astro';
import { loadMirrorDocsTitles } from '../lib/mirrorz-docs/loader';
import docsLock from '../../mirrorz-docs.lock.json';

export const GET: APIRoute = async () => {
  const titles = await loadMirrorDocsTitles();
  const lines = [
    '# 浙江大学开源软件镜像站 / ZJU Mirror',
    '',
    '> 镜像使用帮助文档。内容语言为中文；英文界面的帮助页目前也使用相同的中文正文。',
    '',
    '## 使用说明',
    '',
    '- `/docs/<id>/` 为交互式帮助页面，`/docs/<id>.md` 为使用默认选项的 Markdown。',
    '- Markdown 开头列出镜像地址与选项。若需其他版本或配置，在页面调整选项并使用“复制全文”。',
    '- 文档覆盖所有共享帮助，文档存在不代表本站提供对应镜像；当前目录、地址与状态请查阅 mirrorz.json。',
    '- 本索引及文档在构建时生成，不包含实时同步状态。',
    `- MirrorZ Docs 源提交：${docsLock.commit}。文档许可：CC BY-NC-SA 4.0。`,
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
          `- [${title.replace(/[\[\]\\]/g, '\\$&')}](https://mirrors.zju.edu.cn/docs/${encodeURIComponent(id)}.md): ${id} 镜像使用帮助。`
      ),
    '',
  ];
  return new Response(lines.join('\n'), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
