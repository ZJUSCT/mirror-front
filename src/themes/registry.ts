import terrariaStylesheet from './terraria/theme.css?url';
import stardewStylesheet from './stardew/theme.css?url';
import palettes from './palettes.json';

/** Build-time registry. Theme assets are requested only after selection. */
export const siteThemes = [
  {
    id: 'default',
    name: { zh: '默认', en: 'Default' },
    description: {
      zh: 'Material 2 · 简洁清晰',
      en: 'Material 2 · clean and familiar',
    },
    swatches: ['#f0f3f8', '#154a87', '#14704a'],
    stylesheet: '',
    family: '',
    palettes: null,
    scenery: [],
  },
  {
    id: 'terraria',
    name: { zh: '泰拉瑞亚', en: 'Terraria' },
    description: { zh: '像素天空与神圣之地', en: 'Pixel skies and the Hallow' },
    swatches: ['#9ed5ff', '#d9b978', '#aa7ad3'],
    stylesheet: terrariaStylesheet,
    family: 'game',
    palettes: palettes.terraria,
    scenery: [
      'terrain terrain--back',
      'terrain terrain--mid',
      'sprite sprite--moon only-dark',
      'sprite sprite--tree-left',
      'sprite sprite--tree-right',
      'terrain terrain--front-left',
      'terrain terrain--front-right',
      'sprite sprite--pixie only-light',
      'sprite sprite--unicorn only-light',
      'sprite sprite--gastropod only-dark',
    ],
  },
  {
    id: 'stardew',
    name: { zh: '星露谷物语', en: 'Stardew Valley' },
    description: {
      zh: '田园风光与木质面板',
      en: 'Country scenery and wooden panels',
    },
    swatches: ['#bfe4ff', '#d3ae72', '#6fae53'],
    stylesheet: stardewStylesheet,
    family: 'game',
    palettes: palettes.stardew,
    scenery: [
      'ground ground--back',
      'ground ground--front',
      'sprite sprite--banner',
      'sprite sprite--house',
      'sprite sprite--rider',
      'sprite sprite--junimo',
      'sprite sprite--walnut',
      'sprite sprite--fruit',
      'sprite sprite--coral',
    ],
  },
];

// Small palettes are available before first paint; artwork and fonts are lazy.
export const siteThemePalettes = siteThemes
  .flatMap((theme) =>
    theme.palettes
      ? Object.entries(theme.palettes).map(
          ([mode, values]) =>
            `:root[data-site-theme="${theme.id}"][data-theme="${mode}"] {${Object.entries(
              values
            )
              .map(([key, value]) => `${key}:${value}`)
              .join(';')}}`
        )
      : []
  )
  .join('\n');
