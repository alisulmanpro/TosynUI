/** A value an author can give an attribute. Boolean attributes are present (`true`) or absent. */
export type AttributeValue = string | boolean;

/** An element in the intent tree, such as `screen`, `section` or `action`. */
export interface ElementNode {
  element: string;
  attributes?: Record<string, AttributeValue>;
  children?: TosynNode[];
}

/** A run of text inside an element whose content model is `text`. */
export interface TextNode {
  text: string;
}

export type TosynNode = ElementNode | TextNode;

/** The intermediate representation (IR) of one screen. */
export interface TosynDocument {
  /** Version of the intent language, for example `"0.1"`. */
  tosyn: string;
  root: ElementNode;
}

export type AttributeType = 'string' | 'identifier' | 'boolean' | 'enum';

export interface AttributeDefinition {
  type: AttributeType;
  /** Allowed values. Present only when `type` is `enum`. */
  values?: readonly string[];
  required?: boolean;
  /** When true, no two elements of this type in one document may share the value. */
  unique?: boolean;
  default?: AttributeValue;
  description: string;
}

/** What an element may contain: other elements, text, or nothing. */
export type ContentModel = 'elements' | 'text' | 'none';

export interface ElementDefinition {
  /** One line describing what the element is. */
  summary: string;
  /** How to use the element correctly, written for both people and AI models. */
  guidance: string;
  attributes: Record<string, AttributeDefinition>;
  content: ContentModel;
  /** Elements allowed as direct children when `content` is `elements`. */
  children: readonly string[];
}

/** The complete definition of one version of the intent language. */
export interface Catalog {
  specVersion: string;
  /** The element every document must start with. */
  root: string;
  elements: Record<string, ElementDefinition>;
}

export type DiagnosticCode =
  | 'invalid-structure'
  | 'unsupported-version'
  | 'invalid-root'
  | 'unknown-element'
  | 'unknown-attribute'
  | 'missing-attribute'
  | 'invalid-attribute-value'
  | 'invalid-child'
  | 'empty-content'
  | 'duplicate-value';

/** One problem found in a document. Messages are written so a model can act on them directly. */
export interface Diagnostic {
  code: DiagnosticCode;
  message: string;
  /** JSON Pointer to the offending value, for example `/root/children/0/attributes/intent`. */
  path: string;
}

export interface ValidationResult {
  valid: boolean;
  diagnostics: Diagnostic[];
}
