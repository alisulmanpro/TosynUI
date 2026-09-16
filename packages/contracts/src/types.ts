export interface ComponentContract {
  schemaVersion: '0.1';
  id: string;
  version: `${number}.${number}.${number}`;
  description: string;
  styling: {
    baseClass: string;
    modifiers: string[];
  };
  structure: {
    rootElement: string;
    requiredAttributes: string[];
  };
}

export interface ValidationResult {
  valid: boolean;
  errors: ReadonlyArray<{
    instancePath?: string;
    schemaPath?: string;
    keyword?: string;
    message?: string;
  }>;
}
