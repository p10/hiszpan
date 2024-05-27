import { beforeEach, expect, test } from 'vitest';
import type { Word } from '../types';
import { createWords } from '../words.server';
import { fs } from 'zx';

const filename = 'db-tests.json';
const path = `${process.cwd()}/data/${filename}`;
// let words: ReturnType<typeof createWords>;
const words = createWords(filename);

async function wordsFromFile() {
  const d = (await fs.readJson(path)) as { words: Word[] };
  return d.words;
}

async function writeWords(words: Word[]) {
  await fs.writeJson(path, { words });
}

beforeEach(async () => {
  await fs.ensureFile(path);
  await fs.writeFile(path, '', { encoding: 'utf-8' });
});

test('add', async () => {
  const res = await words.add({ name: 'beber', variant: 'p1', value: 'bebo' });

  expect(res).toMatchObject({
    name: 'beber',
    sumOfBad: 0,
    sumOfGood: 0,
  });
  expect((await wordsFromFile()).length).toEqual(1);
});

test('add aleready exists', async () => {
  await words.add({ name: 'a', variant: 'p1', value: 'a' });

  await expect(() =>
    words.add({ name: 'a', variant: 'p1', value: 'a' }),
  ).rejects.toThrow();

  expect((await wordsFromFile()).length).toEqual(1);
});

test('answer good', async () => {
  await words.add({ name: 'a', variant: 'p1', value: 'a' });
  await words.add({ name: 'b', variant: 'p1', value: 'b' });

  await words.answer({ name: 'a', variant: 'p1' }, 'a');

  const w = await wordsFromFile();
  expect(w[0].lastAnswer?.isGood).toEqual(true);
  expect(w[0].sumOfGood).toEqual(1);
});

test('answer bad', async () => {
  await words.add({ name: 'a', variant: 'p1', value: 'a' });
  await words.add({ name: 'b', variant: 'p1', value: 'b' });

  await words.answer({ name: 'a', variant: 'p1' }, 'bad');

  const w = await wordsFromFile();
  expect(w[0].lastAnswer?.isGood).toEqual(false);
  expect(w[0].sumOfBad).toEqual(1);
});

test('answer for not exsiting word', async () => {
  await expect(() =>
    words.answer({ name: 'a', variant: 'p1' }, 'a'),
  ).rejects.toThrow();
});

test('word for guessing based on sums', async () => {
  await writeWords([
    {
      name: 'a',
      variant: 'p1',
      value: 'aa',
      sumOfBad: 0,
      sumOfGood: 1,
      createdAt: '2024-05-13T22:00:00',
    },
    {
      name: 'b',
      variant: 'p1',
      value: 'bb',
      sumOfBad: 0,
      sumOfGood: 0,
      createdAt: '2024-05-13T22:00:00',
    },
  ]);
  const word = await words.wordForGuessing(() => 0);
  expect(word.name).toEqual('b');
});

test('word for guessing based on empty last answer', async () => {
  await writeWords([
    {
      name: 'a',
      variant: 'p1',
      value: 'aa',
      sumOfBad: 0,
      sumOfGood: 0,
      createdAt: '2024-05-13T22:00:00',
    },
    {
      name: 'b',
      variant: 'p1',
      value: 'bb',
      sumOfBad: 0,
      sumOfGood: 0,
      createdAt: '2024-05-13T22:00:00',
    },
  ]);
  const word = await words.wordForGuessing(() => 0);
  expect(word.name).toEqual('a');
});

test('word for guessing based on last answer', async () => {
  await writeWords([
    {
      name: 'a',
      variant: 'p1',
      value: 'aa',
      sumOfBad: 1,
      sumOfGood: 0,
      lastAnswer: { isGood: true, date: '2010-05-13T22:00:00' },
      createdAt: '2024-05-13T22:00:00',
    },
    {
      name: 'b',
      variant: 'p1',
      value: 'aa',
      sumOfBad: 1,
      sumOfGood: 0,
      lastAnswer: { isGood: true, date: '2020-05-13T22:00:00' },
      createdAt: '2024-05-13T22:00:00',
    },
    {
      name: 'd',
      variant: 'p1',
      value: 'aa',
      sumOfBad: 1,
      sumOfGood: 0,
      lastAnswer: { isGood: true, date: '1999-05-13T22:00:00' },
      createdAt: '2024-05-13T22:00:00',
    },
    {
      name: 'c',
      variant: 'p1',
      value: 'bb',
      sumOfBad: 1,
      sumOfGood: 0,
      lastAnswer: { isGood: true, date: '2000-05-13T22:00:00' },
      createdAt: '2024-05-13T22:00:00',
    },
  ]);
  const word = await words.wordForGuessing(() => 0);
  expect(word.name).toEqual('d');
});
