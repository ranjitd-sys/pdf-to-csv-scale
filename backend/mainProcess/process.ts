import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
import { extractText } from "unpdf";
import { parseInvoiceBlock } from "./match";
const folderPath = "./out";

export const ConvertToCsv = Effect.gen(function* () {
  let allPdfContent = [];

  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() => Bun.file(filePath).arrayBuffer());

    const rawBytes = yield* Effect.promise(() => extractText(data));
    const first = rawBytes.text.map(normalize).map(parseInvoiceBlock).flatMap(data => data);
    allPdfContent.push(first)
    
  }
  const result = allPdfContent.flatMap(data => data);
  console.log(result)
  return result;
});
const res = await Effect.runPromise(ConvertToCsv);

