import { createWords } from '$lib/words/words.server';
import type { Actions } from './$types';

const words = createWords('db.json');

export const actions = {
  default: async () => {
    // TODO:
  },
} satisfies Actions;
