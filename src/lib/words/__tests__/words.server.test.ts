import { beforeEach, expect, test } from 'vitest';
import { createWords, type Word } from '../words.server';
import { fs } from 'zx';

const filename = 'db-tests.json';
const path = `${process.cwd()}/data/${filename}`;
let words: ReturnType<typeof createWords>;

async function wordsFromFile() {
  const d = (await fs.readJson(path)) as { words: Word[] };
  return d.words;
}

beforeEach(async () => {
  await fs.ensureFile(path);
  await fs.writeFile(path, '', { encoding: 'utf-8' });
  words = createWords(filename);
});

test('add', async () => {
  const res = await words.add({ name: 'beber', variety: 'p1', value: 'bebo' });

  expect(res).toMatchObject({
    name: 'beber',
    sumOfBad: 0,
    sumOfGood: 0,
  });
  expect((await wordsFromFile()).length).toEqual(1);
});

test('add aleready exists', async () => {
  await words.add({ name: 'a', variety: 'p1', value: 'a' });

  await expect(() =>
    words.add({ name: 'a', variety: 'p1', value: 'a' }),
  ).rejects.toThrow();

  expect((await wordsFromFile()).length).toEqual(1);
});

test('answer good', async () => {
  await words.add({ name: 'a', variety: 'p1', value: 'a' });
  await words.add({ name: 'b', variety: 'p1', value: 'b' });

  await words.answer({ name: 'a', variety: 'p1' }, 'a');

  const w = await wordsFromFile();
  expect(w[0].lastAnswer?.isGood).toEqual(true);
  expect(w[0].sumOfGood).toEqual(1);
});

test('answer bad', async () => {
  await words.add({ name: 'a', variety: 'p1', value: 'a' });
  await words.add({ name: 'b', variety: 'p1', value: 'b' });

  await words.answer({ name: 'a', variety: 'p1' }, 'bad');

  const w = await wordsFromFile();
  expect(w[0].lastAnswer?.isGood).toEqual(false);
  expect(w[0].sumOfBad).toEqual(1);
});

test('answer for not exsiting word', async () => {
  await expect(() =>
    words.answer({ name: 'a', variety: 'p1' }, 'a'),
  ).rejects.toThrow();
});
