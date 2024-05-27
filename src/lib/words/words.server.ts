import { fs } from 'zx';
import type { InputWordsCombo, Variant, Word } from './types';

type Data = {
  words: Word[];
};

type InputWord = {
  name: string;
  value: string;
  variant: Variant;
};

type Id = Pick<Word, 'name' | 'variant'>;

type Instance = ReturnType<typeof create>;

const instances = new Map<string, Instance>();

export function createWords(filename: string): Instance {
  const i = instances.get(filename);
  if (!i) {
    const words = create(filename);
    instances.set(filename, words);
    return words;
  }
  return i;
}

function create(filename: string) {
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

      return words[select(lessPopularWords.length)];
    },

    /**
     * @deprecated
     *  jeszcze nie jest używane
     */
    async list() {
      const data = await readFile(filename);
      return data.words;
    },
  };
}

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
  await fs.ensureFile(filePath(filename));
  try {
    return await fs.readJson(filePath(filename));
  } catch (e) {
    const data = init();
    await saveFile(filename, data);
    return data;
  }
}

async function saveFile(filename: string, data: Data) {
  return fs.writeJson(filePath(filename), data, { spaces: 2 });
}

function filePath(filename: string) {
  return `${process.cwd()}/data/${filename}`;
}

// produces iso like format '2024-05-06T12:14:10' but for local time
function dateToISOLikeButLocal(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000;
  const msLocal = date.getTime() - offsetMs;
  const dateLocal = new Date(msLocal);
  const iso = dateLocal.toISOString();
  const isoLocal = iso.slice(0, 19);
  return isoLocal;
}
