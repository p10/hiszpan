import { inputWordSchema } from '$lib/words/types';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { fields } from '$lib/form';

export const load: PageServerLoad = async ({ locals }) => {
  const words = await locals.words.listCombos();
  return { words };
};

export const actions = {
  default: async ({ request, locals }) => {
    const data = await request.formData();
    const input = {
      name: data.get('name'),
      variant: data.get('variant'),
      value: data.get('value'),
    };

    const parsed = inputWordSchema.safeParse(input);
    if (!parsed.success) {
      return fail(400, {
        fields: fields(input, parsed.error?.issues ?? []),
      });
    }

    console.log('update word', parsed.data);
    await locals.words.updateValue(parsed.data);

    return {
      fields: fields(input, [], { empty: true }),
      success: true,
    };
  },
} satisfies Actions;
