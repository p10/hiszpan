import { beforeEach, expect, test } from 'vitest';
import { createWords } from '../words.server';
import { fs } from 'zx';

const path = `${process.cwd()}/data/db-tests.json`;
let words: Awaited<ReturnType<typeof createWords>>;

beforeEach(async () => {
  await fs.ensureFile(path);
  await fs.writeFile(path, '', { encoding: 'utf-8' });
  words = await createWords('db-tests.json');
});

test('add', async () => {
  const res = await words.add({
    polish: 'pić',
    espanol: 'beber',
    variety: 'p1',
    value: 'bebo',
  });

  expect(res).toBe(undefined);
  expect(words.list().length).toEqual(1);
});

test('add aleready exists', async () => {
  await words.add({
    polish: 'pić',
    espanol: 'beber',
    variety: 'p1',
    value: 'bebo',
  });
  const res = await words.add({
    polish: 'dupa',
    espanol: 'beber',
    variety: 'p1',
    value: 'elo',
  });
  expect(res?.type).toEqual('AlreadyExists');
  expect(words.list().length).toEqual(1);
});
