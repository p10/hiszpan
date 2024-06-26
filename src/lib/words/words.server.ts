import { fs } from 'zx';
import type { InputWord, InputWordsCombo, Variant, Word } from './types';

type Data = {
  words: Word[];
};

type Id = Pick<Word, 'name' | 'variant'>;

export function createWords(filename: string) {
  async function updateWords(words: Word[]) {
    const data = await readFile(filename);
    await saveFile(filename, { ...data, words });
  }

  return {
    async addCombo(input: InputWordsCombo) {
      const data = await readFile(filename);
      const newWords = prepareCombo(data, input);
      await updateWords([...data.words, ...newWords]);
    },

    async addCombos(input: InputWordsCombo[]) {
      const data = await readFile(filename);
      const newWords = input.flatMap((i) => prepareCombo(data, i));
      await updateWords([...data.words, ...newWords]);
    },

    async updateValue(input: InputWord) {
      const data = await readFile(filename);
      const word = findById(data.words, input);
      if (word === undefined) {
        throw new Error('word does not exists');
      }
      const updatedWord = {
        ...word,
        value: input.value,
      };
      await updateWords(
        data.words.map((w) => (sameId(word, w) ? updatedWord : w)),
      );
      return updatedWord;
    },

    async add(input: InputWord) {
      const data = await readFile(filename);
      if (findById(data.words, input) !== undefined) {
        throw new Error('word already exists');
      }
      const word = {
        ...input,
        sumOfBad: 0,
        sumOfGood: 0,
        createdAt: dateToISOLikeButLocal(new Date()),
      };
      await updateWords([...data.words, word]);
      return word;
    },

    async answer(id: Id, ans: string): Promise<boolean> {
      const data = await readFile(filename);
      const word = findById(data.words, id);
      if (word === undefined) {
        throw new Error('word does not exists');
      }
      const isGood = word.value === ans;
      const updatedWord = {
        ...word,
        lastAnswer: {
          date: dateToISOLikeButLocal(new Date()),
          isGood,
        },
        sumOfGood: isGood ? word.sumOfGood + 1 : word.sumOfGood,
        sumOfBad: !isGood ? word.sumOfBad + 1 : word.sumOfBad,
      };
      const updated = data.words.map((w) => (sameId(w, id) ? updatedWord : w));
      await updateWords(updated);
      return isGood;
    },

    async getById(id: Id): Promise<Word> {
      const { words } = await readFile(filename);
      const word = findById(words, id);
      if (!word) {
        throw new Error(`No word for id ${id}`);
      }
      return word;
    },

    async wordForGuessing(select: (n: number) => number): Promise<Word> {
      const { words } = await readFile(filename);
      if (words.length === 0) {
        throw new Error('there is no words in database');
      }

      // not empty array of words not gussed correctly or new words
      const lessPopularWords = words.reduce<Word[]>((acc, word) => {
        const added = acc[0];
        if (!added) {
          return [word];
        }
        if (word.sumOfGood < added.sumOfGood) {
          return [word];
        }
        if (word.sumOfGood === added.sumOfGood) {
          return acc.concat(word);
        }
        return acc;
      }, []);

      lessPopularWords.sort((a, b) => {
        const atime = lastAnswerTimestamp(a);
        const btime = lastAnswerTimestamp(b);
        if (atime < btime) {
          // oldest first
          return -1;
        } else if (atime > btime) {
          return 1;
        }
        return 0;
      });

      return lessPopularWords[select(lessPopularWords.length)];
    },

    async listCombos(): Promise<Combo[]> {
      const { words } = await readFile(filename);
      const groups = words.reduce<Record<string, Word[]>>((acc, word) => {
        return {
          ...acc,
          [word.name]: [...(acc[word.name] || []), word],
        };
      }, {});

      const combos = Object.entries(groups).map(([name, words]) => {
        const wordsDict = words.reduce<Record<Variant, Word>>(
          (acc, word) => {
            return {
              ...acc,
              [word.variant]: word,
            };
          },
          {} as Record<Variant, Word>,
        );
        return { name, ...wordsDict };
      });

      return combos;
    },
  };
}

type Combo = { name: string } & Record<Variant, Word>;

function init(): Data {
  return {
    words: [],
  };
}

function prepareCombo(data: Data, input: InputWordsCombo) {
  const newWords = Object.keys(input)
    .filter((key) => key !== 'name')
    .map<Word>((key) => {
      // TODO: może guard który wywala błąd gdy string nie jest variantem?
      return {
        name: input.name,
        variant: key as Variant,
        value: input[key as Variant],
        sumOfBad: 0,
        sumOfGood: 0,
        createdAt: dateToISOLikeButLocal(new Date()),
      };
    });
  const someExists = newWords.some(
    (word) => findById(data.words, word) !== undefined,
  );
  if (someExists) {
    throw new Error(`Word "${input.name}" already exists`);
  }
  return newWords;
}

function sameId(id1: Id, id2: Id) {
  return id1.name === id2.name && id1.variant === id2.variant;
}

function findById(list: Word[], id: Id) {
  return list.find((el) => sameId(el, id));
}

const lastAnswerTimestamp = (w: Word) =>
  w.lastAnswer?.date ? new Date(w.lastAnswer.date).getTime() : 0;

async function readFile(filename: string): Promise<Data> {
  await fs.ensureFile(filename);
  try {
    return await fs.readJson(filename);
  } catch (e) {
    const data = init();
    await saveFile(filename, data);
    return data;
  }
}

async function saveFile(filename: string, data: Data) {
  return fs.writeJson(filename, data, { spaces: 2 });
}

// iso like format '2024-05-06T12:14:10' but for local time
function dateToISOLikeButLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  const isoLocal = iso.slice(0, 19);
  return isoLocal;
}
