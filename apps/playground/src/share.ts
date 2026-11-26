/**
 * Share links keep the markup in the URL hash, so a link is the whole screen: nothing is stored
 * on a server and the hash is never sent to one. The markup is compressed, then written as
 * URL-safe base64.
 */
const KEY = 'markup=';

async function transform(
  bytes: Uint8Array<ArrayBuffer>,
  stream: CompressionStream | DecompressionStream,
) {
  const output = new Blob([bytes]).stream().pipeThrough(stream);
  return new Uint8Array(await new Response(output).arrayBuffer());
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function fromBase64Url(text: string): Uint8Array<ArrayBuffer> {
  const binary = atob(text.replaceAll('-', '+').replaceAll('_', '/'));
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

/** The hash that holds this markup, for example `#markup=...`. */
export async function encodeMarkup(markup: string): Promise<string> {
  const bytes = new TextEncoder().encode(markup);
  return `#${KEY}${toBase64Url(await transform(bytes, new CompressionStream('deflate-raw')))}`;
}

/** The markup in a hash made by `encodeMarkup`, or `undefined` if the hash has none or is broken. */
export async function decodeMarkup(hash: string): Promise<string | undefined> {
  const value = hash.replace(/^#/, '');
  if (!value.startsWith(KEY)) return undefined;
  try {
    const bytes = await transform(
      fromBase64Url(value.slice(KEY.length)),
      new DecompressionStream('deflate-raw'),
    );
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return undefined;
  }
}

/** True when the hash is a share link, even a broken one. */
export function isShareHash(hash: string): boolean {
  return hash.replace(/^#/, '').startsWith(KEY);
}
