import { z } from 'zod';

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

const MIN_MESSAGE = { message: 'Musi zawierać conajmniej 2 litery' };

export const inputWordsComboSchema = z.object({
  name: z.string().min(2, MIN_MESSAGE),
  p1: z.string().min(2, MIN_MESSAGE),
  p2: z.string().min(2, MIN_MESSAGE),
  p3: z.string().min(2, MIN_MESSAGE),
  m1: z.string().min(2, MIN_MESSAGE),
  m2: z.string().min(2, MIN_MESSAGE),
  m3: z.string().min(2, MIN_MESSAGE),
});

export type InputWordsCombo = z.infer<typeof inputWordsComboSchema>;

export const inputListoOfWordsComboSchema = z
  .array(inputWordsComboSchema)
  .nonempty();
