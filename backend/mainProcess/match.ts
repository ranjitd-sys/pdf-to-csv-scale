import { extractIndianState } from "./state";

export interface InvoiceDetails {
  name: string | undefined;
  address: string;
  state: string | null;
  pincode: string | undefined
  sn: string | undefined
  description: string | undefined;
  hsn: string | undefined
  quantity: string | undefined
  gross_amount: string |undefined
  discount: string | undefined
  taxable_value: string | undefined
}

export function normalize(text: string): string {
  return text
    .replace(/\r/g, "")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

export function extractInvoiceDetails(text: string): InvoiceDetails | null {
  // 1. Extract "Ship To" block
  // Looks for text between "SHIP TO:" and "SN."
  const shipToMatch = text.match(/SHIP TO:\s*([\s\S]+?)\nSN\./i);

  // 2. Extract Line Item Details
  // Uses Named Capture Groups (?<name>...) for clarity
  const itemRegex =
    /(?<sn>\d+)\s+(?<desc>[\s\S]+?)\n(?<hsn>\d{6})\s+(?<qty>\d+)\s+Rs\.(?<gross>\d+\.\d+)\s+Rs\.(?<disc>\d+\.\d+)\s+Rs\.(?<taxable>\d+\.\d+)/;
  
  const itemMatch = text.match(itemRegex);

  // 3. Guard Clause: If either section is missing, return null immediately
  if (!shipToMatch?.[1] || !itemMatch?.groups) {
    return null;
  }

  // 4. Process Address Lines
  const rawAddressBlock = shipToMatch[1];
  const addressLines = rawAddressBlock
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Safety check if address block was empty
  if (addressLines.length === 0) return null;

  const fullAddressString = addressLines.join(" ");

  // 5. Destructure regex groups for cleaner assignment
  const { sn, desc, hsn, qty, gross, disc, taxable } = itemMatch.groups;

  return {
    // Address Details
    name: addressLines[0],
    address: addressLines.slice(1).join(" "),
    state: extractIndianState(rawAddressBlock),
    pincode: fullAddressString.match(/\b\d{6}\b/)?.[0] ?? "",

    // Item Details
    sn: sn,
    description: desc?.replace(/\n/g, " ").trim(),
    hsn: hsn,
    quantity: qty,
    gross_amount: gross,
    discount: disc,
    taxable_value: taxable,
  };
}