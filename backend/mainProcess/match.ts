import { extractIndianState } from "./state";

export type ParsedInvoiceRow = {
  ship_to_name?: string;
  ship_to_address?: string;
  ship_to_state?: string;
  ship_to_pincode?: string;

  item_sn?: number;
  item_description?: string;
  hsn?: string;
  quantity?: number;
  gross_amount?: number;
  discount?: number;
  taxable_value?: number;

  tax_type?: string;
  sgst_rate?: number;
  sgst_amount?: number;
  cgst_rate?: number;
  cgst_amount?: number;
  total_tax?: number;

  item_total?: number;
};

export function parseInvoiceBlock(text: string): ParsedInvoiceRow[] {
  const normalized = text.replace(/\r/g, "").trim();

  /* ---------- SHIP TO ---------- */
  const shipToMatch = normalized.match(/SHIP TO:\s*([\s\S]+?)\nSN\./i);

  let ship_to_name = "";
  let ship_to_address = "";
  let ship_to_state = "";
  let ship_to_pincode = "";

  if (shipToMatch && shipToMatch[1]) {
    const lines = shipToMatch[1]
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean);

    const joined = lines.join(" ");

    ship_to_name = lines[0] ?? "";
    ship_to_address = lines.slice(1).join(" ");
    ship_to_state = extractIndianState(joined);
    ship_to_pincode = joined.match(/\b\d{6}\b/)?.[0] ?? "";
  }

  /* ---------- ITEM CORE ---------- */
  const itemMatch = normalized.match(
    /(\d+)\s+([\s\S]+?)\n(\d{6})\s+(\d+)\s+Rs\.(\d+\.\d+)\s+Rs\.(\d+\.\d+)\s+Rs\.(\d+\.\d+)/i
  );

  if (!itemMatch) {
    return [];
  }

  const item_sn = Number(itemMatch[1]);
  const item_description = itemMatch[2]?.replace(/\n/g, " ").trim();
  const hsn = itemMatch[3];
  const quantity = Number(itemMatch[4]);
  const gross_amount = Number(itemMatch[5]);
  const discount = Number(itemMatch[6]);
  const taxable_value = Number(itemMatch[7]);

  /* ---------- TAX ---------- */
  const sgstMatch = normalized.match(/SGST\s*@([\d.]+)%\s*:Rs\.([\d.]+)/i);
  const cgstMatch = normalized.match(/CGST\s*@([\d.]+)%\s*:Rs\.([\d.]+)/i);

  const tax_type = sgstMatch && cgstMatch ? "SGST+CGST" : "";

  const sgst_rate = sgstMatch ? Number(sgstMatch[1]) : 0;
  const sgst_amount = sgstMatch ? Number(sgstMatch[2]) : 0;

  const cgst_rate = cgstMatch ? Number(cgstMatch[1]) : 0;
  const cgst_amount = cgstMatch ? Number(cgstMatch[2]) : 0;

  const total_tax =
    sgstMatch && cgstMatch ? sgst_amount + cgst_amount : 0;

  /* ---------- ITEM TOTAL ---------- */
  const totalMatch = normalized.match(/\nRs\.(\d+\.\d+)\s*$/);
  const item_total = totalMatch ? Number(totalMatch[1]) : 0;

  /* ---------- FINAL ARRAY (ONE ROW) ---------- */
  return [
    {
      ship_to_name,
      ship_to_address,
      ship_to_state,
      ship_to_pincode,

      item_sn,
      item_description,
      hsn,
      quantity,
      gross_amount,
      discount,
      taxable_value,

      tax_type,
      sgst_rate,
      sgst_amount,
      cgst_rate,
      cgst_amount,
      total_tax,

      item_total
    }
  ];
}
