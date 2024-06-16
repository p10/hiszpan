import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fields } from '$lib/form';
import { inputWordsComboSchema } from '$lib/words/types';

export const actions = {
  default: async ({ request, locals }) => {
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
        fields: fields(input, parsed.error?.issues ?? []),
      });
    }

    try {
      await locals.words.addCombo(parsed.data);
    } catch (err) {
      console.error(err);
      return {
        fields: fields(input, []),
        error: (err as Error).message,
      };
    }
    return {
      fields: fields(input, [], { empty: true }),
      success: true,
    };
  },
} satisfies Actions;
