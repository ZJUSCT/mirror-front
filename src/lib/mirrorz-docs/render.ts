import Mustache from 'mustache';

import type { TemplateVariables } from './types';

const ordinaryVariable = /\{\{\s*([A-Za-z_.][\w.-]*)\s*\}\}/g;

export function renderTemplateText(
  source: string,
  variables: TemplateVariables
): string {
  const rawTextTemplate = source.replaceAll(
    ordinaryVariable,
    (_whole, name: string) => `{{{${name}}}}`
  );
  return Mustache.render(rawTextTemplate, variables);
}
