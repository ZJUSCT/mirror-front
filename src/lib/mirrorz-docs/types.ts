export type TemplateValue = string | boolean;
export type TemplateVariables = Record<string, TemplateValue>;

export interface SelectChoice {
  label: string;
  values: TemplateVariables;
}

export interface SelectInput {
  kind: 'select';
  name: string;
  title: string;
  note?: string;
  choices: SelectChoice[];
  defaultIndex: number;
}

export interface BooleanInput {
  kind: 'boolean';
  name: string;
  title: string;
  note?: string;
  defaultValue: boolean;
  trueValue: TemplateValue;
  falseValue: TemplateValue;
}

export interface TextInput {
  kind: 'text';
  name: string;
  title: string;
  note?: string;
  defaultValue: string;
}

export type DocumentInput = SelectInput | BooleanInput | TextInput;

export interface DocumentControlGroup {
  id: string;
  inputNames: string[];
  // An absent templateId denotes a document-wide control at its authored position.
  templateId?: string;
}

export interface DocumentTemplate {
  id: string;
  source: string;
  inline: boolean;
  language?: string;
  inputNames: string[];
  filepath?: string;
  append: boolean;
}

export interface MirrorzDocument {
  routeId: string;
  docsId: string;
  title: string;
  html: string;
  markdown: string;
  inputs: DocumentInput[];
  templates: DocumentTemplate[];
  controlGroups: DocumentControlGroup[];
  initialVariables: TemplateVariables;
  requiredScheme: 'http' | 'https' | null;
  sourceCommit: string;
}

export interface MirrorDocsMapping {
  docsId: string | null;
  publicPath: string;
}
