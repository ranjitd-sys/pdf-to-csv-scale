import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join } from "path";
import { extractText } from "unpdf";
const folderPath = "../out";

export const getAllFiles = Effect.gen(function* () {
  const allPdfContent: string[] = [];

  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter(file => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() =>
      Bun.file(filePath).arrayBuffer()
    );

    const rawBytes = yield* Effect.promise(() =>
      extractText(data)
    );

    for (const page of rawBytes.text) {
      allPdfContent.push(page);
    }
  }

  return allPdfContent;
});

const res = await Effect.runPromise(getAllFiles);
console.log(res)