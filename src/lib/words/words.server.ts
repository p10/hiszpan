import { fs } from 'zx';
import { ZodError, z } from 'zod';

type Data = {
  words: Word[];
};

const InputWordSchema = z.object({
  polish: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
  espanol: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
  variety: z.enum(['p1', 'p2', 'p3', 'm1', 'm2', 'm3']),
  value: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
});

type InputWord = z.infer<typeof InputWordSchema>;

type Word = InputWord & {
  createdAt: string;
  lastAnswer?: { date: Date; isGood: boolean };
  sumOfGood: number;
  sumOfBad: number;
};

type AlreadyExistsError = Readonly<{
  type: 'AlreadyExists';
  message: string;
}>;

type ValidationError = Readonly<{
  type: 'ValidationError';
  issues: ZodError['issues'];
}>;

export async function createWords(fileName: string) {
  let data = await readFile(fileName);

  async function updateWords(words: Word[]) {
    data = {
      words,
    };
    await saveFile(fileName, data);
  }

  return {
    async add(
      input: InputWord,
    ): Promise<undefined | ValidationError | AlreadyExistsError> {
      if (wordExists(data.words, input)) {
        return { type: 'AlreadyExists', message: 'word already exists' };
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

function wordExists(list: Word[], word: InputWord) {
  return (
    list.find(
      (w) => word.espanol === w.espanol && word.variety === w.variety,
    ) !== undefined
  );
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
