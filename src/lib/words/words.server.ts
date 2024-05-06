import { fs } from 'zx';
import { ZodError, z } from 'zod';

type Data = {
  words: Word[];
};

const WordSchema = z.object({
  polish: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
  espanol: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
  variety: z.enum(['p1', 'p2', 'p3', 'm1', 'm2', 'm3']),
  value: z.string().min(2, { message: 'Musi zawierać conajmniej 2 litery' }),
  lastAnswered: z
    .object({
      date: z.string().datetime(),
      isBood: z.boolean(),
    })
    .optional(),
  sumOfGood: z.number(),
  sumOfBad: z.number(),
});

type Word = z.infer<typeof WordSchema>;

type AlreadyExistsError = Readonly<{
  type: 'AlreadyExists';
  message: string;
}>;

type ValidationError = Readonly<{
  type: 'ValidationError';
  issues: ZodError['issues'];
}>;

type InputWord = Pick<Word, 'polish' | 'espanol' | 'variety' | 'value'>;

export async function createWords(fileName: string) {
  const data = await readFile(fileName);

  return {
    async add(
      input: InputWord,
    ): Promise<undefined | ValidationError | AlreadyExistsError> {
      if (wordExists(data.words, input)) {
        return { type: 'AlreadyExists', message: 'word already exists' };
      }
      const result = WordSchema.safeParse({
        ...input,
        sumOfBad: 0,
        sumOfGood: 0,
      });
      if (result.success) {
        result.data;
        await saveFile(fileName, {
          words: [...data.words, result.data],
        });
        return undefined;
      }
      return { type: 'ValidationError', issues: result.error.issues };
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
    ) !== null
  );
}

async function readFile(fileName: string): Promise<Data> {
  await fs.ensureFile(filePath(fileName));
  try {
    const data = await fs.readJson(filePath(fileName));
    return data;
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
