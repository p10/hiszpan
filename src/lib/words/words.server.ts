import { fs } from 'zx';

type Data = {
  words: Word[];
};

type Word = {
  polish: string;
  espanol: string;
  variety: 'p1' | 'p2' | 'p3' | 'm1' | 'm2' | 'm3';
  value: string;
  createdAt: Date;
};

export async function createWords(fileName: string) {
  const data = await readFile(fileName);

  return {
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
