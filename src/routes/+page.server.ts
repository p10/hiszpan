import { createWords } from '$lib/words/words.server';

const words = await createWords('db.json');

// words.add({
//   polish: 'kurwa',
//   espanol: 'curve',
//   variety: 'p1',
//   value: 'curvie',
// });
console.log(JSON.stringify(words.list(), null, 2));
