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

export async function createWords(fileName: string) {
  let data = await readFile(fileName);

  async function updateWords(words: Word[]) {
    data = {
      words,
    };
    await saveFile(fileName, data);
  }

  return {
    async addCombo(input: InputWordsCombo) {
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
