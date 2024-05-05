import { createWords } from '$lib/words/words.server';

const words = await createWords('db.json');
console.log(words);
