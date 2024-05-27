import { fail } from '@sveltejs/kit';
import type { Actions } from './$types';
import { fieldsCustom, fieldsWithIssues } from '$lib/form';
import { inputListoOfWordsComboSchema } from '$lib/words/types';

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const dataObj = { text: data.get('text') };
    const input =
      data
        .get('text')
        ?.toString()
        ?.split('\n')
        .map((line) => {
          const parts = line.split(',').map((s) => s.trim());
          return {
            name: parts[0],
            p1: parts[1],
            p2: parts[2],
            p3: parts[3],
            m1: parts[4],
            m2: parts[5],
            m3: parts[6],
          };
        }) ?? [];

    const parsed = inputListoOfWordsComboSchema.safeParse(input);
    if (!parsed.success) {
      return fail(400, {
        fields: fieldsCustom(dataObj, { text: 'Zły format danych' }),
      });
    }

    try {
      await locals.words.addCombos(parsed.data);
    } catch (err) {
      console.error(err);
      return {
        fields: fieldsWithIssues(dataObj, []),
        error: (err as Error).message,
      };
    }
    return {
      fields: fieldsWithIssues(dataObj, [], { empty: true }),
      success: true,
    };
  },
} satisfies Actions;
