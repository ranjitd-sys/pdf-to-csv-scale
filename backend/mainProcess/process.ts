import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
import { extractText } from "unpdf";
import { extractInvoiceDetails } from "./match";
const folderPath = "./out";

export const ConvertToCsv = Effect.gen(function* () {
  let allPdfContent: string[] = [];

  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() => Bun.file(filePath).arrayBuffer());

    const rawBytes = yield* Effect.promise(() => extractText(data));
    const first = rawBytes.text.map(normalize).map(extractInvoiceDetails);
    console.log(first)
  }
  return allPdfContent;
});
const data = await Effect.runPromise(ConvertToCsv);
