export const variants = ['p1', 'p2', 'p3', 'm1', 'm2', 'm3'] as const;

export type Variety = (typeof variants)[number];

export type Word = {
  name: string;
  value: string;
  variety: Variety;
  createdAt: string;
  lastAnswer?: { date: string; isGood: boolean };
  sumOfGood: number;
  sumOfBad: number;
};
