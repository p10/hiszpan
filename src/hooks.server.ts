import { createWords } from '$lib/words/words.server';
import type { Handle } from '@sveltejs/kit';
import { os } from 'zx';

const words = createWords(`${os.homedir()}/.hiszpan.json`);

export const handle: Handle = async ({ event, resolve }) => {
  event.locals.words = words;
  const response = await resolve(event);
  return response;
};
