import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
import { extractText } from "unpdf";
import { extractCreditNote } from "./creaditNoteParser";
const folderPath = "./out";

export const Process = Effect.gen(function* () {
  let TaxInvoiceCount = 0;
  let CreditNoteCount = 0;

  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() => Bun.file(filePath).arrayBuffer());

    const rawBytes = yield* Effect.promise(() => extractText(data));
    const first = rawBytes.text.map(data => {
      if(data.includes("Credit Note")){
        console.log("Processing Credit Note");
        CreditNoteCount ++;
        
      }
      else{
        console.log("Processing Tax Invoices ")
        TaxInvoiceCount++
      }
    });
  }
  console.log(TaxInvoiceCount);
  console.log(CreditNoteCount)
});
const res = await Effect.runPromise(Process);

