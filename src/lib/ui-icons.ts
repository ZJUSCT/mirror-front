import brightness4Module from '@iconify/icons-ic/baseline-brightness-4';
import brightnessAutoModule from '@iconify/icons-ic/baseline-brightness-auto';
import brightnessHighModule from '@iconify/icons-ic/baseline-brightness-high';
import calendarTodayModule from '@iconify/icons-ic/baseline-calendar-today';
import chevronLeftModule from '@iconify/icons-ic/baseline-chevron-left';
import chevronRightModule from '@iconify/icons-ic/baseline-chevron-right';
import closeModule from '@iconify/icons-ic/baseline-close';
import contentCopyModule from '@iconify/icons-ic/baseline-content-copy';
import folderModule from '@iconify/icons-ic/baseline-folder';
import formatListBulletedModule from '@iconify/icons-ic/baseline-format-list-bulleted';
import gridViewModule from '@iconify/icons-ic/baseline-grid-view';
import helpModule from '@iconify/icons-ic/baseline-help';
import historyModule from '@iconify/icons-ic/baseline-history';
import infoModule from '@iconify/icons-ic/baseline-info';
import labelModule from '@iconify/icons-ic/baseline-label';
import personModule from '@iconify/icons-ic/baseline-person';
import searchModule from '@iconify/icons-ic/baseline-search';
import showChartModule from '@iconify/icons-ic/baseline-show-chart';
import translateModule from '@iconify/icons-ic/baseline-translate';
import verifiedModule from '@iconify/icons-ic/baseline-verified';

export interface UiIcon {
  width: number;
  height: number;
  body: string;
}

function normalizeIcon(value: unknown): UiIcon {
  const module = value as { default?: UiIcon };
  return module.default ?? (value as UiIcon);
}

/** Generic interface glyphs from Google Material Icons. */
export const brightnessAutoIcon = normalizeIcon(brightnessAutoModule);
export const brightnessDarkIcon = normalizeIcon(brightness4Module);
export const brightnessLightIcon = normalizeIcon(brightnessHighModule);
export const calendarTodayIcon = normalizeIcon(calendarTodayModule);
export const chevronLeftIcon = normalizeIcon(chevronLeftModule);
export const chevronRightIcon = normalizeIcon(chevronRightModule);
export const closeIcon = normalizeIcon(closeModule);
export const contentCopyIcon = normalizeIcon(contentCopyModule);
export const folderIcon = normalizeIcon(folderModule);
export const formatListBulletedIcon = normalizeIcon(formatListBulletedModule);
export const gridViewIcon = normalizeIcon(gridViewModule);
export const helpIcon = normalizeIcon(helpModule);
export const historyIcon = normalizeIcon(historyModule);
export const infoIcon = normalizeIcon(infoModule);
export const labelIcon = normalizeIcon(labelModule);
export const personIcon = normalizeIcon(personModule);
export const searchIcon = normalizeIcon(searchModule);
export const statisticsIcon = normalizeIcon(showChartModule);
export const translateIcon = normalizeIcon(translateModule);
export const verifiedIcon = normalizeIcon(verifiedModule);
