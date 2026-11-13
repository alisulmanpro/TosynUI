/** Token types this package understands, from the W3C Design Tokens format (2025.10). */
export type TokenType =
  'color' | 'dimension' | 'duration' | 'fontFamily' | 'fontWeight' | 'number' | 'cubicBezier';

export interface ColorValue {
  colorSpace: string;
  components: number[];
  alpha?: number;
  hex?: string;
}

export interface UnitValue {
  value: number;
  unit: string;
}

export type TokenValue = ColorValue | UnitValue | string | string[] | number | number[];

/** A token with its type and its value after aliases are followed. */
export interface ResolvedToken {
  /** Dot-separated path, for example `color.surface-raised`. */
  name: string;
  type: TokenType;
  value: TokenValue;
  description?: string;
}

/** A DTCG token file: nested groups whose leaves have a `$value`. */
export type TokenTree = { [key: string]: unknown };

const TYPES = new Set<TokenType>([
  'color',
  'dimension',
  'duration',
  'fontFamily',
  'fontWeight',
  'number',
  'cubicBezier',
]);

const ALIAS = /^\{([^{}]+)\}$/;

interface RawToken {
  name: string;
  type: TokenType | undefined;
  value: unknown;
  description?: string;
}

/** Thrown when a token file is malformed or an alias cannot be resolved. */
export class TokenError extends Error {
  override name = 'TokenError';
}

/**
 * Merges token trees, later trees overriding earlier ones, then resolves every alias.
 * Returns tokens sorted by name. Throws `TokenError` with the offending token's name on failure.
 */
export function resolveTokens(...trees: TokenTree[]): ResolvedToken[] {
  const merged = trees.reduce<TokenTree>((result, tree) => mergeTrees(result, tree), {});
  const raw = new Map<string, RawToken>();
  collect(merged, [], undefined, raw);

  const resolved = new Map<string, ResolvedToken>();
  const resolve = (name: string, chain: string[]): ResolvedToken => {
    const done = resolved.get(name);
    if (done) return done;
    const token = raw.get(name);
    if (!token) {
      throw new TokenError(`Alias {${name}} in ${chain.at(-1)} does not point to a token.`);
    }
    if (chain.includes(name)) {
      throw new TokenError(`Circular alias: ${[...chain, name].join(' -> ')}.`);
    }

    let type = token.type;
    let value: TokenValue;
    const alias = typeof token.value === 'string' ? ALIAS.exec(token.value) : null;
    if (alias?.[1]) {
      const target = resolve(alias[1], [...chain, name]);
      type ??= target.type;
      if (type !== target.type) {
        throw new TokenError(
          `${name} is ${type} but aliases ${target.name}, which is ${target.type}.`,
        );
      }
      value = target.value;
    } else {
      if (!type) throw new TokenError(`${name} has no $type and is not an alias.`);
      value = checkValue(name, type, token.value);
    }

    const result: ResolvedToken = { name, type, value };
    if (token.description) result.description = token.description;
    resolved.set(name, result);
    return result;
  };

  for (const name of raw.keys()) resolve(name, []);
  return [...resolved.values()].sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
}

function mergeTrees(base: TokenTree, override: TokenTree): TokenTree {
  const result: TokenTree = { ...base };
  for (const [key, value] of Object.entries(override)) {
    const existing = result[key];
    const isGroup = (item: unknown): item is TokenTree =>
      typeof item === 'object' && item !== null && !Array.isArray(item) && !('$value' in item);
    result[key] = isGroup(existing) && isGroup(value) ? mergeTrees(existing, value) : value;
  }
  return result;
}

function collect(
  group: TokenTree,
  path: string[],
  inheritedType: TokenType | undefined,
  into: Map<string, RawToken>,
): void {
  const groupType = readType(group.$type, path) ?? inheritedType;
  for (const [key, item] of Object.entries(group)) {
    if (key.startsWith('$')) continue;
    const itemPath = [...path, key];
    if (typeof item !== 'object' || item === null || Array.isArray(item)) {
      throw new TokenError(`${itemPath.join('.')} must be a group or a token.`);
    }
    const node = item as TokenTree;
    if ('$value' in node) {
      const token: RawToken = {
        name: itemPath.join('.'),
        type: readType(node.$type, itemPath) ?? groupType,
        value: node.$value,
      };
      if (typeof node.$description === 'string') token.description = node.$description;
      into.set(token.name, token);
    } else {
      collect(node, itemPath, groupType, into);
    }
  }
}

function readType(value: unknown, path: string[]): TokenType | undefined {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && TYPES.has(value as TokenType)) return value as TokenType;
  throw new TokenError(
    `${path.join('.') || 'root'} has unsupported $type ${JSON.stringify(value)}.`,
  );
}

function checkValue(name: string, type: TokenType, value: unknown): TokenValue {
  const fail = (expected: string): never => {
    throw new TokenError(`${name} must be ${expected}; got ${JSON.stringify(value)}.`);
  };
  const isRecord = (item: unknown): item is Record<string, unknown> =>
    typeof item === 'object' && item !== null && !Array.isArray(item);

  switch (type) {
    case 'color': {
      if (
        !isRecord(value) ||
        typeof value.colorSpace !== 'string' ||
        !Array.isArray(value.components) ||
        value.components.length !== 3 ||
        !value.components.every((component) => typeof component === 'number')
      ) {
        return fail('a color object with colorSpace and three components');
      }
      if (value.colorSpace !== 'srgb')
        return fail('an srgb color (other color spaces are not yet supported)');
      if (
        value.hex !== undefined &&
        (typeof value.hex !== 'string' || !/^#[0-9a-f]{6}$/i.test(value.hex))
      ) {
        return fail('a color whose hex is #rrggbb');
      }
      return value as unknown as ColorValue;
    }
    case 'dimension':
    case 'duration': {
      const units = type === 'dimension' ? ['px', 'rem'] : ['ms', 's'];
      if (
        !isRecord(value) ||
        typeof value.value !== 'number' ||
        !units.includes(String(value.unit))
      ) {
        return fail(`{ value, unit } with unit ${units.join(' or ')}`);
      }
      return { value: value.value, unit: String(value.unit) };
    }
    case 'fontFamily':
      if (typeof value === 'string') return value;
      if (
        Array.isArray(value) &&
        value.length > 0 &&
        value.every((item) => typeof item === 'string')
      ) {
        return value as string[];
      }
      return fail('a font name or a list of font names');
    case 'fontWeight':
      return typeof value === 'number' && value >= 1 && value <= 1000
        ? value
        : fail('a number from 1 to 1000');
    case 'number':
      return typeof value === 'number' ? value : fail('a number');
    case 'cubicBezier':
      return Array.isArray(value) &&
        value.length === 4 &&
        value.every((item) => typeof item === 'number')
        ? (value as number[])
        : fail('four numbers');
  }
}
