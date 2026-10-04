// Inlined with a build-time registry by SiteLayout. No runtime script imports:
// directory listings authorize this exact script through their CSP hash.
(() => {
  const themes = __SITE_THEMES__;
  const root = document.documentElement;
  const storageKey = 'zju-mirror:siteTheme';
  const read = () => {
    try {
      return localStorage.getItem(storageKey);
    } catch {
      return null;
    }
  };
  const lookup = (id) => themes.find((theme) => theme.id === id) ?? themes[0];
  let request = 0;
  const stylesheets = new Map();
  const load = (theme) => {
    if (!theme.stylesheet) return Promise.resolve();
    if (stylesheets.has(theme.id)) return stylesheets.get(theme.id);
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = theme.stylesheet;
    link.dataset.siteThemeStylesheet = theme.id;
    const loaded = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => failed(), 10000);
      const failed = () => {
        clearTimeout(timeout);
        stylesheets.delete(theme.id);
        link.remove();
        reject(new Error('Theme stylesheet unavailable'));
      };
      link.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      link.onerror = failed;
    });
    stylesheets.set(theme.id, loaded);
    document.head.append(link);
    return loaded;
  };
  const lang = root.lang === 'zh' ? 'zh' : 'en';
  const render = (theme) => {
    root.dataset.siteTheme = theme.id;
    root.dataset.themeFamily = theme.family;
    const scene = document.querySelector('#theme-scenery');
    const template = document.querySelector(`#theme-scene-${theme.id}`);
    if (scene)
      scene.replaceChildren(
        ...(template ? [template.content.cloneNode(true)] : [])
      );
    document.querySelectorAll('[data-site-theme-choice]').forEach((input) => {
      input.checked = input.value === theme.id;
    });
    const hint = document.querySelector('[data-site-theme-hint]');
    if (hint)
      hint.textContent = `${lang === 'zh' ? '主题' : 'Theme'} · ${theme.name[lang]}`;
    const toggle = document.querySelector('#site-theme-toggle');
    if (toggle)
      toggle.setAttribute('aria-label', hint?.textContent ?? theme.name[lang]);
  };
  const initial = lookup(read());
  // Apply the small palette immediately, without hiding the page for assets.
  root.dataset.siteTheme = initial.id;
  root.dataset.themeFamily = initial.family;
  const initialLoad = load(initial).catch(() => {
    if (request === 0) render(themes[0]);
  });
  document.addEventListener(
    'DOMContentLoaded',
    () => {
      render(lookup(root.dataset.siteTheme));
      const toggle = document.querySelector('#site-theme-toggle');
      const panel = document.querySelector('#site-theme-panel');
      const status = document.querySelector('#site-theme-status');
      if (!toggle || !panel) return;
      const close = (restoreFocus = false) => {
        panel.hidden = true;
        toggle.setAttribute('aria-expanded', 'false');
        if (restoreFocus) toggle.focus();
      };
      const fitPanel = () => {
        if (panel.hidden) return;
        panel.style.maxHeight = `${Math.max(120, innerHeight - panel.getBoundingClientRect().top - 16)}px`;
      };
      window.addEventListener('resize', fitPanel);
      document.fonts.addEventListener('loadingdone', fitPanel);
      const open = () => {
        panel.hidden = false;
        fitPanel();
        toggle.setAttribute('aria-expanded', 'true');
        panel.querySelector('input:checked')?.focus();
      };
      toggle.addEventListener('click', () =>
        panel.hidden ? open() : close(true)
      );
      document.addEventListener('pointerdown', (event) => {
        if (!panel.contains(event.target) && !toggle.contains(event.target))
          close();
      });
      document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !panel.hidden) {
          event.preventDefault();
          close(true);
        }
      });
      document.addEventListener('focusin', (event) => {
        if (
          !panel.hidden &&
          !panel.contains(event.target) &&
          event.target !== toggle
        )
          close();
      });
      const select = async (id, persist, closeAfterSelection = false) => {
        const currentRequest = ++request;
        const theme = lookup(id);
        status.textContent = lang === 'zh' ? '正在加载主题…' : 'Loading theme…';
        panel.setAttribute('aria-busy', 'true');
        try {
          await load(theme);
          if (currentRequest !== request) return;
          render(theme);
          fitPanel();
          if (persist) {
            try {
              localStorage.setItem(storageKey, theme.id);
            } catch {}
            if (closeAfterSelection) close(true);
          }
          status.textContent = '';
        } catch {
          if (currentRequest !== request) return;
          render(lookup(root.dataset.siteTheme));
          status.textContent =
            lang === 'zh'
              ? '主题加载失败，请重试。'
              : 'Could not load the theme. Please try again.';
        } finally {
          if (currentRequest === request) panel.removeAttribute('aria-busy');
        }
      };
      let pointerSelection = false;
      panel.addEventListener('pointerdown', () => {
        pointerSelection = true;
      });
      panel.addEventListener('keydown', () => {
        pointerSelection = false;
      });
      panel.addEventListener('change', (event) => {
        if (event.target.matches('[data-site-theme-choice]'))
          select(event.target.value, true, pointerSelection);
      });
      window.addEventListener('storage', (event) => {
        if (event.key === storageKey || event.key === null)
          select(read(), false);
      });
      // Keep the browser chrome in step with both visual theme and color mode.
      const chromeColor = () => {
        const color = getComputedStyle(root)
          .getPropertyValue('--background')
          .trim();
        document
          .querySelector('meta[name="theme-color"]')
          ?.setAttribute('content', color);
      };
      new MutationObserver(chromeColor).observe(root, {
        attributes: true,
        attributeFilter: ['data-theme', 'data-site-theme'],
      });
      initialLoad.then(chromeColor);
    },
    { once: true }
  );
})();
