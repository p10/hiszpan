import { fs } from 'zx';
import { z } from 'zod';

const MIN_MESSAGE = { message: 'Musi zawierać conajmniej 2 litery' };

type Data = {
  words: Word[];
};

export const inputWordsComboSchema = z.object({
  name: z.string().min(2, MIN_MESSAGE),
  p1: z.string().min(2, MIN_MESSAGE),
  p2: z.string().min(2, MIN_MESSAGE),
  p3: z.string().min(2, MIN_MESSAGE),
  m1: z.string().min(2, MIN_MESSAGE),
  m2: z.string().min(2, MIN_MESSAGE),
  m3: z.string().min(2, MIN_MESSAGE),
});

type InputWordsCombo = z.infer<typeof inputWordsComboSchema>;

type Variety = keyof Omit<InputWordsCombo, 'name'>;

type InputWord = {
  name: string;
  value: string;
  variety: Variety;
};

type Word = InputWord & {
  createdAt: string;
  lastAnswer?: { date: string; isGood: boolean };
  sumOfGood: number;
  sumOfBad: number;
};

type Id = Pick<Word, 'name' | 'variety'>;

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
      const newWords = Object.keys(input)
        .filter((key) => key !== 'name')
        .map<Word>((key) => {
          // TODO: może guard który wywala błąd gdy string nie jest variety?
          return {
            name: input.name,
            variety: key as Variety,
            value: input[key as Variety],
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

    async answer(id: Id, ans: string) {
      const data = await readFile(filename);
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

function sameId(id1: Id) {
  return (id2: Id) => {
    return id1.name === id2.name && id1.variety === id2.variety;
  };
}

function findById(list: Word[], id: Id) {
  return list.find(sameId(id));
}

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
  return fs.writeJson(filePath(filename), data);
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
