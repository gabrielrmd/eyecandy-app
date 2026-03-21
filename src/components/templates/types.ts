export interface TemplateSchema {
  id: string;
  name: string;
  category: string;
  sheets: TemplateSheet[];
}

export interface TemplateSheet {
  id: string;
  name: string;
  type: "table" | "form" | "summary";
  description?: string;
  columns?: TableColumn[];
  fields?: FormField[];
  sections?: FormSection[];
  groupBy?: string;
  defaultRows?: number;
  computedColumns?: ComputedColumn[];
}

export interface TableColumn {
  id: string;
  header: string;
  type:
    | "text"
    | "number"
    | "score"
    | "dropdown"
    | "date"
    | "url"
    | "currency"
    | "percentage"
    | "textarea"
    | "checkbox"
    | "status";
  width?: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  formula?: string;
  editable?: boolean;
  defaultValue?: string | number;
  colorScale?: {
    ranges: Array<{ min: number; max: number; color: string }>;
  };
}

export interface FormField {
  id: string;
  label: string;
  type:
    | "text"
    | "textarea"
    | "number"
    | "dropdown"
    | "date"
    | "url"
    | "score";
  hint?: string;
  placeholder?: string;
  options?: string[];
  required?: boolean;
  section?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fieldIds: string[];
  collapsible?: boolean;
}

export interface ComputedColumn {
  columnId: string;
  formula: string;
  dependencies: string[];
}

export type TemplateData = Record<string, Record<string, unknown>[]>;
