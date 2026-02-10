import { extractText } from "unpdf";

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

function extractShipTo(text: string) {
  const match = text.match(/SHIP TO:\s*([\s\S]+?)\nSN\./i);
  if (match === null || undefined) return;
  if(match[1] === undefined) return;
  const lines = match[1]
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean);

  return {
    name: lines[0],
    address: lines.slice(1).join(" "),
    state: lines.join(" ").match(/Tamil Nadu|Andhra Pradesh|Karnataka/i)?.[0] ?? "",
    pincode: lines.join(" ").match(/\b\d{6}\b/)?.[0] ?? ""
  };
}
const result = extractShipTo(res);
console.log(result)