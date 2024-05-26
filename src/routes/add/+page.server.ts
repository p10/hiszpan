import { createWords, inputWordsComboSchema } from '$lib/words/words.server';
import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fieldsWithIssues } from '$lib/form';

const words = createWords('db.json');

export const actions = {
  default: async ({ request }) => {
    const data = await request.formData();
    const input = {
      name: data.get('name'),
      p1: data.get('p1'),
      p2: data.get('p2'),
      p3: data.get('p3'),
      m1: data.get('m1'),
      m2: data.get('m2'),
      m3: data.get('m3'),
    };

    const parsed = inputWordsComboSchema.safeParse(input);
    if (!parsed.success) {
      return fail(400, {
        fields: fieldsWithIssues(input, parsed.error?.issues ?? []),
      });
    }

    try {
      await words.addCombo(parsed.data);
    } catch (err) {
      console.error(err);
      return {
        fields: fieldsWithIssues(input, []),
        error: (err as Error).message,
      };
    }
    return {
      fields: fieldsWithIssues(input, [], { empty: true }),
      success: true,
    };
  },
} satisfies Actions;
