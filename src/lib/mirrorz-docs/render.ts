import Mustache from 'mustache';

import { CERNET_MIRROR_ORIGIN, ZJU_MIRROR_ORIGIN } from '../mirror-endpoint';
import type {
  DocumentTemplate,
  MirrorzDocument,
  TemplateVariables,
} from './types';

export type InputState = Record<string, boolean | number | string>;
export interface GuideOptions {
  https?: boolean;
  sudo?: boolean;
  federated?: boolean;
}

export function templateToken(template: DocumentTemplate): string {
  return `ZJUMIRRORDOCSTEMPLATE${template.id.replaceAll('-', '').toUpperCase()}TOKEN`;
}

export function resolveVariables(
  document: MirrorzDocument,
  state: InputState = {},
  options: GuideOptions = {},
  inputNames = document.inputs.map((input) => input.name)
): TemplateVariables {
  const result: TemplateVariables = {};
  for (const input of document.inputs) {
    if (!inputNames.includes(input.name)) continue;
    const value = state[input.name];
    if (input.kind === 'select') {
      Object.assign(
        result,
        input.choices[typeof value === 'number' ? value : input.defaultIndex]
          ?.values
      );
    } else if (input.kind === 'boolean') {
      result[input.name] =
        (value ?? input.defaultValue) ? input.trueValue : input.falseValue;
    } else {
      result[input.name] =
        typeof value === 'string' ? value : input.defaultValue;
    }
  }
  Object.assign(result, document.initialVariables);
  const endpoint = new URL(String(result.endpoint));
  endpoint.protocol = `${document.requiredScheme ?? (options.https === false ? 'http' : 'https')}:`;
  endpoint.host = new URL(
    options.federated ? CERNET_MIRROR_ORIGIN : ZJU_MIRROR_ORIGIN
  ).host;
  return {
    ...result,
    endpoint: endpoint.toString().replace(/\/$/, ''),
    host: endpoint.host,
    mirror: `${endpoint.host}${endpoint.pathname}`,
    path: endpoint.pathname,
    scheme: endpoint.protocol.slice(0, -1),
    http_protocol: `${endpoint.protocol}//`,
    sudo: options.sudo === false ? '' : 'sudo ',
    sudoE: options.sudo === false ? '' : 'sudo -E ',
  };
}

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
