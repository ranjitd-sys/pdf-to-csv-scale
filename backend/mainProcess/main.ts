import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
import { extractText } from "unpdf";
import { parseCreditNoteMeta, extractSoldBy, extractBillTo, extractShipTo, ExtractProduct, parseTaxSection } from "./creaditNoteParser";
import { separateCreditNote } from "./shaprator";

const folderPath = "./out";

export const Process = Effect.gen(function* () {
  let TaxInvoiceCount = 0;
  let CreditNoteCount = 0;
  let allData :any[] = [];
  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() => Bun.file(filePath).arrayBuffer());

    const rawBytes = yield* Effect.promise(() => extractText(data));
    const first = rawBytes.text.map((data) => {
      if (data.includes("Credit Note")) {
        const res = separateCreditNote(data);
        console.log(res)
        const Credit_Note = parseCreditNoteMeta(res.credit_note || "");
        const Sold = extractSoldBy(res.sold_by|| "");
        const Bill = extractBillTo(res.bill_to|| "");
        const Ship = extractShipTo(res.ship_to || "");
        const Product = ExtractProduct(res.product || "");
        const tax  = parseTaxSection(res.taxes || "")
        const finalData = {
          ...Credit_Note,
          ...Sold,
          ...Bill,
          ...Ship,
          ...Product,
          ...tax
        }
        // console.log(first);

        console.log(finalData)
        // allData.push(res);
        CreditNoteCount++;
      } else {
        return
      }
    });
  }
  console.log("Tax Invoice ",TaxInvoiceCount);
  console.log("Credit Note",CreditNoteCount);
  return allData;
});
const response = await Effect.runPromise(Process);
response.map(data => console.log(data))