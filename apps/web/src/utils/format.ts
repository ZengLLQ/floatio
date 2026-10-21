/**
 * Format a binary string into 4-bit nibbles separated by a space.
 * Correctly aligns integer bits from the right (LSB -> MSB)
 * and fraction bits from the left (MSB -> LSB).
 * Handles trailing subscript (e.g. ₂) or suffix (e.g. _2).
 */
export function formatNibbles(
  bits: string,
  options?: { alignRight?: boolean }
): string {
  if (!bits) return '';
  const clean = bits.trim();
  if (/^[+-]?(?:Infinity|NaN)$/i.test(clean)) {
    return clean;
  }

  // Strip and preserve trailing subscript ₂ or _2
  let suffix = '';
  let core = clean;
  if (core.endsWith('₂')) {
    suffix = '₂';
    core = core.slice(0, -1).trim();
  } else if (core.endsWith('_2')) {
    suffix = '₂';
    core = core.slice(0, -2).trim();
  }

  // If the binary string has a binary point (e.g. 1111110.0100)
  if (core.includes('.')) {
    const parts = core.split('.');
    const intRaw = parts[0].replace(/[\s_]+/g, '');
    const fracRaw = parts[1].replace(/[\s_]+/g, '');

    // Integer part groups in nibbles from the right (LSB toward MSB)
    const intRem = intRaw.length % 4;
    let formattedInt = '';
    if (intRem === 0) {
      formattedInt = intRaw.match(/.{1,4}/g)?.join(' ') ?? intRaw;
    } else {
      const firstChunk = intRaw.slice(0, intRem);
      const restChunks = intRaw.slice(intRem).match(/.{1,4}/g)?.join(' ');
      formattedInt = restChunks ? `${firstChunk} ${restChunks}` : firstChunk;
    }

    // Fraction part groups in nibbles from the left (MSB toward LSB)
    const formattedFrac = fracRaw.match(/.{1,4}/g)?.join(' ') ?? fracRaw;
    return `${formattedInt}.${formattedFrac}${suffix}`;
  }

  const stripped = core.replace(/[\s_]+/g, '');
  if (options?.alignRight) {
    // For pure integer binary where we want LSB-aligned nibbles
    const rem = stripped.length % 4;
    if (rem === 0) {
      return (stripped.match(/.{1,4}/g)?.join(' ') ?? stripped) + suffix;
    }
    const firstChunk = stripped.slice(0, rem);
    const restChunks = stripped.slice(rem).match(/.{1,4}/g)?.join(' ');
    return (restChunks ? `${firstChunk} ${restChunks}` : firstChunk) + suffix;
  }

  // Default: fraction or complete 32/64-bit word (groups 4 from left)
  const formatted = stripped.match(/.{1,4}/g)?.join(' ') ?? stripped;
  return `${formatted}${suffix}`;
}
