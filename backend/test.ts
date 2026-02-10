import { extractText } from "unpdf";
import { parseInvoiceBlock } from "./mainProcess/match";

const file = Bun.file("test.pdf");
const content = await file.arrayBuffer();
const text = await extractText(content);

function normalize(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
const res = normalize(text.text.join('\n'));
const data = parseInvoiceBlock(res);
console.log(data)
