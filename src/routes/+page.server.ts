import { createWords } from '$lib/words/words.server';
import type { Actions, PageServerLoad } from './$types';

const words = createWords('db.json');

export const load: PageServerLoad = async () => {
  const guess = await words.random();
};

export const actions = {
  default: async () => {
    // TODO:
  },
} satisfies Actions;
