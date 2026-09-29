(() => {
  const create = (tag, attributes = {}, text) => {
    const node = document.createElement(tag);
    for (const [name, value] of Object.entries(attributes))
      node.setAttribute(name, value);
    if (text !== undefined) node.textContent = text;
    return node;
  };

  const message = document.querySelector('#autoindex-message');
  const table = document.querySelector('#autoindex-list');
  const tableBody = table?.querySelector('tbody');

  const mirrorId = location.pathname.split('/').filter(Boolean)[0] || '';
  const normalizedMirrorId = mirrorId.toLocaleLowerCase();
  const title = document.querySelector('#listing-title');
  const path = document.querySelector('#listing-path');
  if (title && mirrorId) title.textContent = mirrorId;
  if (path) path.textContent = location.pathname;

  const watermark = document.querySelector('#autoindex-watermark');
  const icon = watermark?.querySelector(
    `[data-mirror-icon="${CSS.escape(normalizedMirrorId)}"]`
  );
  if (icon) icon.classList.add('is-visible');

  const stateByCode = {
    S: ['ready', 'SUCCEEDED'],
    D: ['pending', 'PENDING'],
    Y: ['syncing', 'SYNCING'],
    F: ['failed', 'FAILED'],
    P: ['paused', 'PAUSED'],
    C: ['cached', 'CACHED'],
    R: ['proxied', 'PROXIED'],
    U: ['unknown', 'UNKNOWN'],
  };
  const relativeTime = (timestamp) => {
    const seconds = timestamp - Math.floor(Date.now() / 1000);
    const formatter = new Intl.RelativeTimeFormat(navigator.language, {
      numeric: 'auto',
    });
    const ranges = [
      ['year', 31_536_000],
      ['month', 2_592_000],
      ['day', 86_400],
      ['hour', 3_600],
      ['minute', 60],
    ];
    for (const [unit, divisor] of ranges) {
      if (Math.abs(seconds) >= divisor)
        return formatter.format(Math.round(seconds / divisor), unit);
    }
    return formatter.format(seconds, 'second');
  };

  fetch('/mirrorz.json', { signal: AbortSignal.timeout(4000) })
    .then((response) => (response.ok ? response.json() : Promise.reject()))
    .then((data) => {
      const item = data.mirrors?.find((candidate) => {
        const pathId = (() => {
          try {
            return new URL(candidate.url, data.site.url).pathname
              .split('/')
              .filter(Boolean)[0];
          } catch {
            return '';
          }
        })();
        return [candidate.cname, pathId].some(
          (value) => value?.toLocaleLowerCase() === normalizedMirrorId
        );
      });
      if (!item) return;

      if (title) {
        title.textContent = item.cname;
        document.title = `${item.cname} | ZJU Mirror`;
      }
      const statusTokens = item.status?.match(/[A-Z](?:\d+)?/g) || [];
      const mainStatus = statusTokens.find((token) =>
        'SDYFPCRU'.includes(token[0])
      );
      const disabled = data.site?.disable || item.disable;
      const [state, label] = disabled
        ? ['disabled', 'DISABLED']
        : stateByCode[mainStatus?.[0]] || stateByCode.U;
      const status = document.querySelector('#mirror-status');
      if (status) {
        status.className = `status status-${state}`;
        status.textContent = label;
      }

      const oldSuccess = statusTokens.find((token) => token[0] === 'O');
      const timestampToken =
        ['Y', 'F'].includes(mainStatus?.[0]) && oldSuccess
          ? oldSuccess
          : mainStatus;
      const timestamp = Number(timestampToken?.slice(1));
      const updated = document.querySelector('#mirror-updated');
      if (
        updated &&
        Number.isFinite(timestamp) &&
        timestamp > 0 &&
        !['cached', 'proxied'].includes(state)
      ) {
        const date = new Date(timestamp * 1000);
        updated.textContent = `最近更新于 ${date.toLocaleString('zh-CN')} (${relativeTime(timestamp)})`;
        updated.hidden = false;
      }
    })
    .catch(() => {});

  let entries = [];
  let page = 0;
  const pageSize = 200;
  const pagination = document.querySelector('#autoindex-pagination');
  const pageLabel = document.querySelector('#autoindex-page-label');
  const previousPage = document.querySelector('#autoindex-previous');
  const nextPage = document.querySelector('#autoindex-next');
  let requestController;
  let requestGeneration = 0;
  let sortKey = 'name';
  let sortDirection = 'asc';

  // Codepoint order: deterministic for ASCII mirror paths and consistent
  // with nginx's byte-order directory sorting.
  const byName = (left, right) =>
    left.name < right.name ? -1 : left.name > right.name ? 1 : 0;
  const directoryFirst = (left, right) =>
    Number(right.type === 'directory') - Number(left.type === 'directory');
  const comparators = {
    name: byName,
    size: (left, right) => (left.size ?? 0) - (right.size ?? 0),
    mtime: (left, right) =>
      (Date.parse(left.mtime) || 0) - (Date.parse(right.mtime) || 0),
  };

  const compareEntries = (left, right) =>
    directoryFirst(left, right) ||
    (sortDirection === 'desc' ? -1 : 1) *
      (comparators[sortKey](left, right) || byName(left, right));

  const SIZE_UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB'];
  const formatSize = (bytes) => {
    let value = bytes;
    let unit = 0;
    while (value >= 1024 && unit < SIZE_UNITS.length - 1) {
      value /= 1024;
      unit += 1;
    }
    const digits = unit === 0 || value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(digits)} ${SIZE_UNITS[unit]}`;
  };

  // Entry mtimes are GMT strings from nginx autoindex; they are rendered
  // in the visitor's local time zone.
  const dateFormat = new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  });
  const formatDate = (value) => {
    if (!value) return '-';
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '-' : dateFormat.format(date);
  };

  const renderEntryRow = (entry) => {
    const row = document.createElement('tr');
    const nameCell = document.createElement('td');
    const link = document.createElement('a');
    link.href = `${location.pathname}${encodeURIComponent(entry.name)}${
      entry.type === 'directory' ? '/' : ''
    }`;
    link.textContent =
      entry.type === 'directory' ? `${entry.name}/` : entry.name;
    if (entry.type === 'directory') link.dataset.directory = '';
    nameCell.appendChild(link);
    const hasSize = entry.type !== 'directory' && entry.size !== undefined;
    const sizeCell = create(
      'td',
      { class: 'size' },
      hasSize ? formatSize(entry.size) : '-'
    );
    if (hasSize) sizeCell.title = `${entry.size.toLocaleString('zh-CN')} 字节`;
    const dateCell = create('td', { class: 'date' }, formatDate(entry.mtime));
    if (entry.mtime) dateCell.title = entry.mtime;
    row.append(nameCell, sizeCell, dateCell);
    return row;
  };

  const buildParentRow = () => {
    const row = create('tr', { class: 'autoindex-parent' });
    const nameCell = document.createElement('td');
    nameCell.appendChild(
      create(
        'a',
        { href: new URL('../', location.href).pathname, 'data-directory': '' },
        'Parent directory/'
      )
    );
    row.append(
      nameCell,
      create('td', { class: 'size' }, '-'),
      create('td', { class: 'date' }, '-')
    );
    return row;
  };

  const renderList = () => {
    if (!table || !tableBody || !message) return;
    const visible = entries.slice(page * pageSize, (page + 1) * pageSize);
    const rows = document.createDocumentFragment();
    if (location.pathname !== '/') rows.append(buildParentRow());
    for (const entry of visible) rows.append(renderEntryRow(entry));
    tableBody.replaceChildren(rows);
    table.hidden = false;
    message.hidden = entries.length > 0;
    if (!entries.length) message.textContent = '此目录为空。';
    const pages = Math.max(1, Math.ceil(entries.length / pageSize));
    pagination.hidden = entries.length <= pageSize;
    pageLabel.textContent = `第 ${page + 1} / ${pages} 页，共 ${entries.length.toLocaleString('zh-CN')} 项`;
    previousPage.disabled = page === 0;
    nextPage.disabled = page + 1 >= pages;
    for (const header of table.querySelectorAll('th[data-sort-key]')) {
      if (header.getAttribute('data-sort-key') === sortKey)
        header.setAttribute(
          'aria-sort',
          sortDirection === 'asc' ? 'ascending' : 'descending'
        );
      else header.setAttribute('aria-sort', 'none');
    }
  };

  for (const header of table?.querySelectorAll('th[data-sort-key]') ?? []) {
    header.querySelector('button')?.addEventListener('click', () => {
      const key = header.getAttribute('data-sort-key');
      if (sortKey === key)
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      else {
        sortKey = key;
        sortDirection = 'asc';
      }
      entries.sort(compareEntries);
      page = 0;
      renderList();
    });
  }
  previousPage?.addEventListener('click', () => {
    if (page > 0) {
      page -= 1;
      renderList();
    }
  });
  nextPage?.addEventListener('click', () => {
    if ((page + 1) * pageSize < entries.length) {
      page += 1;
      renderList();
    }
  });

  const describeError = (error) => {
    if (error instanceof DOMException && error.name === 'TimeoutError')
      return '请求超时';
    if (error instanceof Error && /^HTTP \d+$/.test(error.message))
      return `服务器返回 ${error.message.slice(5)}`;
    if (error instanceof SyntaxError || error?.message === 'invalid payload')
      return '响应不是有效的目录列表 JSON';
    return '网络请求或目录显示失败，请重试';
  };

  const loadEntries = async () => {
    if (!table || !tableBody || !message) return;
    requestController?.abort();
    const controller = new AbortController();
    requestController = controller;
    const generation = ++requestGeneration;
    table.hidden = true;
    pagination.hidden = true;
    tableBody.replaceChildren();
    entries = [];
    page = 0;
    if (path) path.textContent = location.pathname;
    message.hidden = false;
    message.textContent =
      '正在加载目录列表…首次访问较大的目录可能需要一些时间。';
    try {
      // The reserved path selects JSON explicitly; directory HTML never depends on Accept.
      const components = location.pathname.split('/');
      components.splice(2, 0, '.mirror-index');
      const response = await fetch(components.join('/'), {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(180_000),
        ]),
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const payload = await response.json();
      if (generation !== requestGeneration) return;
      if (!Array.isArray(payload)) throw new Error('invalid payload');
      for (const item of payload) {
        if (
          !item ||
          typeof item.name !== 'string' ||
          !item.name ||
          item.name === '.' ||
          item.name === '..' ||
          /[\/\\\0]/.test(item.name)
        )
          continue;
        entries.push({
          name: item.name,
          type:
            item.type === 'directory'
              ? 'directory'
              : item.type === 'file'
                ? 'file'
                : 'other',
          size:
            typeof item.size === 'number' &&
            Number.isFinite(item.size) &&
            item.size >= 0
              ? item.size
              : undefined,
          mtime: typeof item.mtime === 'string' ? item.mtime : '',
        });
      }
      entries.sort(compareEntries);
      renderList();
    } catch (error) {
      if (generation !== requestGeneration || controller.signal.aborted) return;
      table.hidden = true;
      pagination.hidden = true;
      message.hidden = false;
      message.textContent = `目录列表加载失败：${describeError(error)}`;
    }
  };

  // Intercept only plain directory clicks within this mirror. Downloads, portal
  // links, modifier clicks, and opening a new tab keep their native behavior.
  tableBody?.addEventListener('click', (event) => {
    const link = event.target.closest('a[data-directory]');
    if (
      !link ||
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      link.target ||
      link.hasAttribute('download')
    )
      return;
    const url = new URL(link.href);
    if (
      url.origin !== location.origin ||
      !url.pathname.startsWith(`/${mirrorId}/`)
    )
      return;
    event.preventDefault();
    history.pushState(null, '', url.pathname);
    loadEntries();
  });
  window.addEventListener('popstate', () => {
    if (location.pathname.startsWith(`/${mirrorId}/`)) loadEntries();
    else location.reload();
  });
  loadEntries();
})();
