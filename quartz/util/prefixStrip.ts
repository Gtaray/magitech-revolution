/**
 * Utility function to strip numeric prefixes from display strings
 * Removes patterns like "1. ", "2. ", etc. from the beginning of a string
 */
export function stripNumericPrefix(text: string): string {
  return text.replace(/^\d+(?:\.\d+)*\.(?:\s*[-_]\s*|\s+)*/, "")
}
