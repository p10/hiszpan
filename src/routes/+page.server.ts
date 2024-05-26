import { fieldsCustom, fieldsWithIssues } from '$lib/form';
import { createWords } from '$lib/words/words.server';
import { z } from 'zod';
import type { Actions, PageServerLoad } from './$types';
import { variants } from '$lib/words/types';
import { fail } from '@sveltejs/kit';
import type { Variant } from '$lib/words/types';

const words = createWords('db.json');

export const load: PageServerLoad = async ({ cookies }) => {
  const c = cookies.get('load-word');
  if (c) {
    const [name, variant] = c.split('|');
    const word = await words.getById({ name, variant: variant as Variant });
    cookies.delete('load-word', { path: '/' });
    return { word };
  }
  const word = await words.wordForGuessing(() => 0);
  return { word };
};

const answerSchema = z.object({
  answer: z.string(),
  name: z.string(),
  variant: z.enum(variants),
});

export const actions = {
  default: async ({ request, cookies }) => {
    const data = await request.formData();
    const input = {
      answer: data.get('answer'),
      name: data.get('name'),
      variant: data.get('variant'),
    };
    const parsed = answerSchema.safeParse(input);
    // parsuję tylko po to żeby pozbyć się nulli
    if (!parsed.success) {
      return fail(400, {
        fields: fieldsWithIssues(input, parsed.error?.issues ?? []),
      });
    }
    const { name, variant, answer } = parsed.data;
    const isGood = await words.answer({ name, variant }, answer);
    if (!isGood) {
      cookies.set('load-word', [name, variant].join('|'), { path: '/' });
      return {
        fields: fieldsCustom(input, {
          answer: 'Pudło! Spróbuj jeszcze raz',
        }),
      };
    }
    return { fields: fieldsWithIssues(input, [], { empty: true }) };
  },
} satisfies Actions;
