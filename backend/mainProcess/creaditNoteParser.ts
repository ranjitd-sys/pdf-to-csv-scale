import { Effect, Order, Schema } from "effect";
import type {
  BillTo,
  CreditNoteMeta,
  OrderTaxInfo,
  OtherCharge,
  ParsedProduct,
  Seller,
  Ship,
  TaxDetail,
} from "./Credittypes";
import { CreditNoteId, GstNumber, OrderId } from "./BrandedTypes";
import { validDate } from "effect/Schema";
export const parseCreditNoteMeta = (text: string): CreditNoteMeta => {
  const orderNumber = text.match(
    /(Purchase\s+)?Order\s+Number\s*:\s*(\S+)/i,
  )?.[2];

  const orderDate = text.match(/Order\s+Date\s*:\s*([\d-]+\s+[\d:]+)/i)?.[1];

  const creditNoteNo = text.match(
    /Credit\s+Note\s+(No|Number)\s*:\s*(\S+)/i,
  )?.[2];

  const creditNoteDate = text.match(
    /Credit\s+Note\s+Date\s*:\s*([\d-]+\s+[\d:]+)/i,
  )?.[1];

  const invoiceMatch = text.match(
    /Invoice\s+No\s+and\s+Date\s*:\s*(\S+)\s+([\d-]+\s+[\d:]+)/i,
  );
  const order_number = orderNumber
    ? Schema.decodeUnknownSync(OrderId)(orderNumber.trim())
    : undefined;
  const creditNumber = creditNoteNo
    ? Schema.decodeUnknownSync(CreditNoteId)(creditNoteNo)
    : undefined;
  return {
    order_number: order_number,
    order_date: orderDate,
    credit_note_no: creditNumber,
    credit_note_date: creditNoteDate,
    invoice_no: invoiceMatch?.[1],
    invoice_date: invoiceMatch?.[2],
  };
};

export const extractSoldBy = (text: string): Seller => {
  const clean = text.replace(/\r/g, "").trim();

  const regex =
    /SOLD BY:\s*\n([^\n]+)\n([^,]+),\s*([^,]+),\s*(\d{6})\nGSTIN\s*:\s*([A-Z0-9]+)/i;

  const match = clean.match(regex);

  if (!match) return null;
  const gstNumber = Schema.decodeUnknownSync(GstNumber)(match[5]);
  return {
    seller_name: match[1]!.trim(),
    seller_city: match[2]!.trim(),
    seller_state: match[3]!.trim(),
    seller_pincode: match[4] || "",
    seller_gstin: gstNumber,
  };
};

export function extractBillTo(text: string): BillTo {
  const clean = text.replace(/\r/g, "").trim();

  // Extract name (line after BILL TO:)
  const nameMatch = clean.match(/BILL TO:\s*\n([^\n]+)/i);

  // Extract place of supply
  const placeMatch = clean.match(
    /Place of Supply\s*:\s*(\d+)\s+([A-Za-z\s]+)/i,
  );

  return {
    Bill_name: nameMatch ? nameMatch[1]!.trim() : null,
    place_of_supply_code: placeMatch ? placeMatch[1]!.trim() : null,
    place_of_supply_state: placeMatch ? placeMatch[2]!.trim() : null,
  };
}

export function extractShipTo(text: string): Ship | null {
  const block = text.split(/SHIP TO:/g)[1];
  if (!block) return null;

  const cleaned = block.split(/SN\.\s*Description/i)[0]!.trim();

  const lines = cleaned
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  if (!lines.length) return null;

  const ship_name = lines[0] || null;
  const fullText = lines.slice(1).join(" ");

  const match = fullText.match(/([A-Za-z\s]+),\s*(\d{6})\b/);

  let ship_state = "";
  let ship_pincode = "";
  let ship_city = "";
  let ship_address = fullText;

  if (match) {
    ship_state = match[1]!.trim();
    ship_pincode = match[2] || "";

    ship_address = fullText.replace(match[0], "").trim();

    const cityMatch = ship_address.match(/,\s*([^,]+)\s*$/);
    if (cityMatch) {
      ship_address = ship_address.replace(/,\s*([^,]+)\s*$/, "").trim();
    }
  }

  return {
    ship_name,
    ship_address,
    ship_state,
    ship_pincode,
  };
}

export function ExtractProduct(rawText: string): ParsedProduct | null {
  if (!rawText) return null;

  const cleaned = rawText
    .replace(/Taxes\s+Total/i, "")
    .replace(/\r/g, "")
    .trim();

  /**
   * Supports:
   * - With discount
   * - Without discount
   * - Multiline product names
   * - Flexible spacing
   */

  const regex =
    /^\s*(\d+)\s+([\s\S]+?)\s+(\d{5,})\s+(\d+)\s+Rs\.?\s?(\d+\.\d{2})(?:\s+Rs\.?\s?(\d+\.\d{2}))?\s+Rs\.?\s?(\d+\.\d{2})?\s*$/;

  const match = cleaned.match(regex);

  if (!match) return null;

  const quantity = Number(match[1]);
  const name = match[2]!.replace(/\s+/g, " ").trim();
  const sku = match[3] || "";
  const quantity_confirm = Number(match[4]);

  const firstPrice = Number(match[5]);
  const secondPrice = match[6] ? Number(match[6]) : null;
  const thirdPrice = match[7] ? Number(match[7]) : null;

  return {
    quantity,
    name,
    sku,
    quantity_confirm,
    unit_price: firstPrice,
    discount: thirdPrice ? (secondPrice ?? 0) : 0,
    taxable_value: thirdPrice ?? secondPrice ?? 0,
  };
}

export function parseTaxSection(text: string): OrderTaxInfo {
  const result: OrderTaxInfo = {
    igst: null,
    sgst: null,
    cgst: null,
    other_charges: null,
    total_tax: null,
    grand_total: null,
  };

  // Normalize text
  const cleanText = text.replace(/\r/g, "").trim();
  const lines = cleanText.split("\n").map((l) => l.trim());

  // --------------------------------------------------
  // 1️⃣ Parse IGST / SGST / CGST (Flexible)
  // --------------------------------------------------

  const taxRegex =
    /(IGST|SGST|CGST)\s*@\s*(\d+\.?\d*)%\s*:?\s*Rs\.?\s*(\d+\.?\d*)/gi;

  const taxMatches = [...cleanText.matchAll(taxRegex)];

  for (const match of taxMatches) {
    const type = match[1]?.toUpperCase();
    const rate = Number(match[2]);
    const amount = Number(match[3]);

    if (type === "IGST" && !result.igst) {
      result.igst = { rate, amount };
    }

    if (type === "SGST" && !result.sgst) {
      result.sgst = { rate, amount };
    }

    if (type === "CGST" && !result.cgst) {
      result.cgst = { rate, amount };
    }
  }

  // --------------------------------------------------
  // 2️⃣ Parse OTHER CHARGES (Flexible Line Parsing)
  // --------------------------------------------------

  const otherLine = lines.find((line) =>
    /OTHER\s+CHARGES/i.test(line)
  );

  if (otherLine) {
    const lineNo = otherLine.match(/^(\d+)/)?.[1] ?? null;
    const code =
      otherLine.match(/OTHER\s+CHARGES\s+(\d+)/i)?.[1] ?? "";

    const rsMatches = [...otherLine.matchAll(/Rs\.?\s*(\d+\.?\d*)/g)].map(
      (m) => Number(m[1])
    );

    const taxMatch = otherLine.match(
      /(IGST|SGST|CGST)\s*@\s*(\d+\.?\d*)%\s*:?\s*Rs\.?\s*(\d+\.?\d*)/i
    );

    if (lineNo && taxMatch && rsMatches.length >= 2) {
      result.other_charges = {
        line_no: Number(lineNo),
        description: "OTHER CHARGES",
        code,
        unit_price: rsMatches[0] ?? 0,
        taxable_value: rsMatches[1] ?? 0,
        tax_type: taxMatch[1]?.toUpperCase() || "",
        tax_rate: Number(taxMatch[2]),
        tax_amount: Number(taxMatch[3]),
        line_total: rsMatches[rsMatches.length - 1] ?? 0,
      };
    }
  }

  // --------------------------------------------------
  // 3️⃣ Parse TOTAL Line (Colon + No Decimal Safe)
  // --------------------------------------------------

  const totalLine = lines.find((line) =>
    /^Total\s*:?\s*/i.test(line)
  );

  if (totalLine) {
    const totals = [...totalLine.matchAll(/Rs\.?\s*(\d+\.?\d*)/g)].map(
      (m) => Number(m[1])
    );

    if (totals.length >= 2) {
      result.total_tax = totals[0] || 0;
      result.grand_total = totals[1] || 0;
    }
  }

  return result;
}

