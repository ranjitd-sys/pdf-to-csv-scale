import { extractIndianState } from "./state";

export function normalize(text: string ) {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}



export function extractShipTo(text: string) {
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
    state: extractIndianState(lines.join("")),
    pincode: lines.join(" ").match(/\b\d{6}\b/)?.[0] ?? ""
  };
}
