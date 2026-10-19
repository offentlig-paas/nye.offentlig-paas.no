/** Removes inline markdown markers for plain-text uses (aria-label, charts). */
export function stripMarkdown(text: string): string {
  return text.replace(/(\*\*|__|\*|`)(.+?)\1/g, '$2')
}
