import Ajv2020 from 'ajv/dist/2020.js';
import schema from './schema/component.schema.json' with { type: 'json' };
import type { ComponentContract, ValidationResult } from './types.js';

const ajv = new Ajv2020({ allErrors: true, strict: true });
const validateContract = ajv.compile<ComponentContract>(schema);

export function validateComponentContract(value: unknown): ValidationResult {
  const valid = validateContract(value);
  return { valid, errors: valid ? [] : (validateContract.errors ?? []) };
}

export function assertComponentContract(value: unknown): asserts value is ComponentContract {
  const result = validateComponentContract(value);
  if (!result.valid) {
    const details = result.errors.map(
      (error) => `${error.instancePath ?? '/'} ${error.message ?? 'is invalid'}`,
    );
    throw new Error(
      `Invalid component contract${details.length ? `: ${details.join('; ')}` : '.'}`,
    );
  }
}
