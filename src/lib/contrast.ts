// WCAG contrast ratio (relative luminance).
// Used by the visual reference to live-render pairing matrix ratios.

function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function channel(v: number) {
  const s = v / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function luminance([r, g, b]: [number, number, number]) {
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function contrastRatio(fgHex: string, bgHex: string): number {
  const L1 = luminance(hexToRgb(fgHex));
  const L2 = luminance(hexToRgb(bgHex));
  const [a, b] = L1 > L2 ? [L1, L2] : [L2, L1];
  return (a + 0.05) / (b + 0.05);
}

export function wcagBadge(ratio: number, largeText = false): "AAA" | "AA" | "FAIL" {
  const aaa = largeText ? 4.5 : 7;
  const aa = largeText ? 3 : 4.5;
  if (ratio >= aaa) return "AAA";
  if (ratio >= aa) return "AA";
  return "FAIL";
}
