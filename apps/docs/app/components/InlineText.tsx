/** Renders `backtick` spans from catalog text as inline code. */
export function InlineText({ children }: { children: string }) {
  return children
    .split('`')
    .map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part));
}
