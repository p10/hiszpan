export const variants = ['p1', 'p2', 'p3', 'm1', 'm2', 'm3'] as const;

export type Variant = (typeof variants)[number];

export type Word = {
  name: string;
  value: string;
  variant: Variant;
  createdAt: string;
  lastAnswer?: { date: string; isGood: boolean };
  sumOfGood: number;
  sumOfBad: number;
};

const variantLabels: Record<Variant, string> = {
  p1: 'ja',
  p2: 'ty',
  p3: 'on/ona',
  m1: 'my',
  m2: 'wy',
  m3: 'oni',
};

export function variantLabel(variant: Variant): string {
  return variantLabels[variant];
}
