import { nor } from "effect/Boolean";
import { func } from "effect/FastCheck";

function normalizer(text: string) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

function normalizeKey(header: string) {
  return header
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z_]/g, "");
}
export function Shaparator(text: string) {
  const CreditNote = text.includes("Credit Note");
  if (CreditNote) {
    const HEADER_REGEX =
  /(Credit\s*Note(\s*(Number|No|Date)?)?|SOLD\s*BY|BILL\s*TO|SHIP\s*TO|Amount)/gi;


    const matches = [...text.matchAll(HEADER_REGEX)];

    return matches
      .map((match) => ({
        name: match[0],
        index: match.index!,
      }))
      .sort((a, b) => a.index - b.index);
  }
}

function sliceSections(text: string, headers: { name: string; index: number }[]) {
  const result: Record<string, string> = {};

  for (let i = 0; i < headers.length; i++) {
    const current = headers[i];
    const next = headers[i + 1];
    if(!current ) return;
    const start = current.index + current.name.length;
    const end = next ? next.index : text.length
    console.log(text.slice(start,end))
    result[(current.name)] = text
      .slice(start, end)
      .trim();
  }

  return result;
}

export function getShaparateData(text: string) {
  const cleanedText = normalizer(text);
  const headers = Shaparator(cleanedText);
  if (!headers) {
    return;
  }
  const data = sliceSections(cleanedText, headers);
  return data;
}

//   return sliceSections(cleanedText, headers);
