import { extractText } from "unpdf";
import { extractCreditNote } from "./mainProcess/creaditNoteParser";
import { extractDocument } from "./mainProcess/taxInvoiceParser";


const file = Bun.file("test.pdf");
const content = await file.arrayBuffer();
const text = await extractText(content);

function normalize(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
const res = normalize(text.text.join(""));
console.log(extractDocument(res))

// console.log(res)