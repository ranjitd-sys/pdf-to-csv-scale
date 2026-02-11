import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
import { extractText } from "unpdf";
import { parseInvoiceBlock } from "./match";
import { getShaparateData } from "./saparator";
const folderPath = "./out";

export const Process = Effect.gen(function* () {
  let allPdfContent = [];

  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() => Bun.file(filePath).arrayBuffer());

    const rawBytes = yield* Effect.promise(() => extractText(data));
    const first = rawBytes.text.map(getShaparateData);
    console.log(first)
  }
});
const res = await Effect.runPromise(Process);
console.log(res)
