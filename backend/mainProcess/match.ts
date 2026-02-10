import { extractIndianState } from "./state";

export type ParsedInvoiceRow = {
  invoice_date?: string;
  invoice_no?: string;
  ship_to_name?: string;
  ship_to_address?: string;
  ship_to_state?: string;
  ship_to_pincode?: string;
  sold_by_name?: string;
  item_sn?: number;
  item_description?: string;
  hsn?: string;
  quantity?: number;
  gross_amount?: number;
  discount?: number;
  taxable_value?: number;
  sold_by_address?: string;
  bill_to_name?: string;
  bill_to_address?: string;
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
      .map((l) => l.trim())
      .filter(Boolean);

    const joined = lines.join(" ");

    ship_to_name = lines[0] ?? "";
    ship_to_address = lines.slice(1).join(" ");
    ship_to_state = extractIndianState(joined);
    ship_to_pincode = joined.match(/\b\d{6}\b/)?.[0] ?? "";
  }

  /* ---------- SOLD BY ---------- */
  const soldByMatch = normalized.match(/SOLD BY:\s*([\s\S]+?)\nGSTIN/i);

  let sold_by_name: string | undefined;
  let sold_by_address: string | undefined;

  if (soldByMatch?.[1]) {
    const lines = soldByMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    sold_by_name = lines[0];
    sold_by_address = lines.slice(1).join(" ");
  }
  /* ---------- BILL TO ---------- */
  const billToMatch = normalized.match(
    /BILL TO:\s*([\s\S]+?)\nPlace of Supply/i,
  );

  let bill_to_name: string | undefined;
  let bill_to_address: string | undefined;

  if (billToMatch?.[1]) {
    const lines = billToMatch[1]
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    bill_to_name = lines[0];
    bill_to_address = lines.slice(1).join(" ");
  }
  /* ---------- CREDIT NOTE ---------- */
  const creditNoteNo = normalized.match(
    /Credit Note No:\s*([A-Za-z0-9]+)/i,
  )?.[1];

  const creditNoteDate = normalized.match(
    /Credit Note Date:\s*([\d-]+\s+[\d:]+)/i,
  )?.[1];

  const invoiceNoDateMatch = normalized.match(
    /Invoice No and Date:\s*([A-Za-z0-9]+)\s+([\d-]+\s+[\d:]+)/i,
  );

  const invoice_no = invoiceNoDateMatch?.[1];
  const invoice_date = invoiceNoDateMatch?.[2];

  /* ---------- ITEM CORE ---------- */
  const itemMatch = normalized.match(
    /(\d+)\s+([\s\S]+?)\n(\d{6})\s+(\d+)\s+Rs\.(\d+\.\d+)\s+Rs\.(\d+\.\d+)\s+Rs\.(\d+\.\d+)/i,
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

  const total_tax = sgstMatch && cgstMatch ? sgst_amount + cgst_amount : 0;

  /* ---------- ITEM TOTAL ---------- */
  const totalMatch = normalized.match(/\nRs\.(\d+\.\d+)\s*$/);
  const item_total = totalMatch ? Number(totalMatch[1]) : 0;

  /* ---------- FINAL ARRAY (ONE ROW) ---------- */
  return [
    {
      invoice_date,
      invoice_no,

      ship_to_name,
      ship_to_address,
      ship_to_state,
      ship_to_pincode,
      sold_by_name,
      sold_by_address,
      bill_to_name,
      bill_to_address,
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

      item_total,
    },
  ];
}
