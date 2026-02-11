import { extractText } from "unpdf";
import { getShaparateData } from "./mainProcess/saparator";


const file = Bun.file("ctest.pdf");
const content = await file.arrayBuffer();
const text = await extractText(content);

function normalize(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}
const res = normalize(text.text.join(""));
console.log(getShaparateData(res));
// console.log(res)