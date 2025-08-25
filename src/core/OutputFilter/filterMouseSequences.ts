/**
 * Filter mouse sequences from output method
 */

export function filterMouseSequences(this: any, str: string): string {
  // NUCLEAR FILTERING - remove ANY pattern that could be mouse coordinates
  
  // 1. Remove complete SGR mouse sequences
  str = str.replace(/\x1b\[<[0-9]+;[0-9]+;[0-9]+[Mm]/g, '')
  
  // 2. Remove legacy mouse sequences
  str = str.replace(/\x1b\[M.{3}/g, '')
  
  // 3. Remove raw coordinate patterns (the main culprit!)
  // Pattern: digits;digits;digits followed by M or m
  str = str.replace(/[0-9]+;[0-9]+;[0-9]+[Mm]/g, '')
  
  // 4. Remove partial patterns that start with mouse button codes
  str = str.replace(/\b(0|1|2|32|33|34|35|64|65);[0-9]+;[0-9]+[Mm]?/g, '')
  
  // 5. Remove any standalone coordinate-like patterns
  // This is aggressive but necessary
  str = str.replace(/\b[0-9]{1,3};[0-9]{1,3};[0-9]{1,3}[Mm]\b/g, '')
  
  // 6. Remove repeated patterns (like 65;80;33M65;80;33M)
  str = str.replace(/([0-9]+;[0-9]+;[0-9]+[Mm]){2,}/g, '')
  
  // 7. Clean up any orphaned escape sequences
  str = str.replace(/\x1b\[<$/g, '')
  str = str.replace(/\x1b\[$/g, '')
  
  return str
}