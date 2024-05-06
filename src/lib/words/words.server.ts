import { fs } from 'zx';
import { z } from 'zod';

type Data = {
  words: Word[];
};

const InputWordSchema = z.object({
  name: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
  variety: z.enum(['p1', 'p2', 'p3', 'm1', 'm2', 'm3']),
  value: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
});

type InputWord = z.infer<typeof InputWordSchema>;

export type Word = InputWord & {
  createdAt: string;
  lastAnswer?: { date: string; isGood: boolean };
  sumOfGood: number;
  sumOfBad: number;
};

type Id = Pick<Word, 'name' | 'variety'>;

export async function createWords(fileName: string) {
  let data = await readFile(fileName);

  async function updateWords(words: Word[]) {
    data = {
      words,
    };
    await saveFile(fileName, data);
  }

  return {
    async add(input: InputWord) {
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
      return undefined;
    },

    async answer(id: Id, ans: string) {
      if (findById(data.words, id) === undefined) {
        throw new Error('word does not exists');
      }
      const updatedWords = data.words.map((w) => {
        if (!sameId(id)(w)) {
          return w;
        }
        const isGood = w.value === ans;
        return {
          ...w,
          lastAnswer: {
            date: dateToISOLikeButLocal(new Date()),
            isGood,
          },
          sumOfGood: isGood ? w.sumOfGood + 1 : w.sumOfGood,
          sumOfBad: !isGood ? w.sumOfBad + 1 : w.sumOfBad,
        };
      });
      await updateWords(updatedWords);
    },

    list() {
      return data.words;
    },
  };
}

function init(): Data {
  return {
    words: [],
  };
}

function sameId(id1: Id) {
  return (id2: Id) => {
    return id1.name === id2.name && id1.variety === id2.variety;
  };
}

function findById(list: Word[], id: Id) {
  return list.find(sameId(id));
}

async function readFile(fileName: string): Promise<Data> {
  await fs.ensureFile(filePath(fileName));
  try {
    return await fs.readJson(filePath(fileName));
  } catch (e) {
    const data = init();
    await saveFile(fileName, data);
    return data;
  }
}

async function saveFile(fileName: string, data: Data) {
  return fs.writeJson(filePath(fileName), data);
}

function filePath(fileName: string) {
  return `${process.cwd()}/data/${fileName}`;
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
