// creditNoteParser.ts

import { extractIndianState } from "./state";

export function extractCreditNote(text: string) {
  const clean = text.replace(/\r/g, "").trim();

  // ======================================
  // BASIC FIELD EXTRACTION
  // ======================================

  const orderNumber =
    clean.match(/Order\s*Number:\s*(\S+)/i)?.[1] || null;

  const orderDate =
    clean.match(/Order\s*Date:\s*([0-9:\-\s]+)/i)?.[1]?.trim() || null;

  const creditNoteNo =
    clean.match(/Credit\s*Note\s*No:\s*(\S+)/i)?.[1] || null;

  const creditNoteDate =
    clean.match(/Credit\s*Note\s*Date:\s*([0-9:\-\s]+)/i)?.[1]?.trim() || null;

  const invoiceMatch = clean.match(
    /Invoice\s*No\s*and\s*Date:\s*(\S+)\s*([0-9:\-\s]+)/i
  );

  const invoiceNumber = invoiceMatch?.[1] || null;
  const invoiceDate = invoiceMatch?.[2]?.trim() || null;

  const gstin =
    clean.match(/GSTIN\s*:\s*([0-9A-Z]+)/i)?.[1] || null;

  // ======================================
  // SECTION EXTRACTOR
  // ======================================

  function extractSection(start: string, end: string) {
    const regex = new RegExp(`${start}([\\s\\S]*?)${end}`, "i");
    return clean.match(regex)?.[1]?.trim();
  }

  const soldBySection = extractSection("SOLD BY:", "BILL TO:");
  const billToSection = extractSection("BILL TO:", "SHIP TO:");
  const shipToSection = extractSection("SHIP TO:", "SN\\.");

  // ======================================
  // INDIAN ADDRESS PARSER
  // ======================================

  function parseIndianAddress(section?: string) {
    if (!section) return null;

    const lines = section
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .filter(l => !/GSTIN/i.test(l));

    const name = lines[0] || null;

    const stateLine = lines.find(l => /\d{6}/.test(l));

    let city: string | null = null;
    let state: string | null = null;
    let pincode: string | null = null;

    if (stateLine) {
      const match = stateLine.match(/(.+?),\s*([^,]+),\s*(\d{6})/);
      if (match) {
        city = match[1]?.trim()||"";
        state = extractIndianState(text)
        pincode = match[3] || "";
      }
    }

    const addressLines = lines
      .slice(1)
      .filter(l => l !== stateLine);

    return {
      name,
      address_line: addressLines.join(" ") || null,
      city,
      state,
      pincode
    };
  }

  // ======================================
  // PRODUCT DESCRIPTION EXTRACTOR
  // ======================================

  function extractProductDescription(text: string) {
    const match = text.match(
      /\n1\s+([\s\S]*?)\n\d{6}\s+\d+\s+Rs\./
    );

    if (!match || match[1] === undefined ) return null;
    
    return match[1]
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)
      .join(" ");
  }

  // ======================================
  // PRODUCT PRICE + TAX EXTRACTOR
  // ======================================

  function extractProductPricing(text: string) {
    const lineMatch = text.match(
      /(\d{6})\s+(\d+)\s+Rs\.?([\d.]+)\s+Rs\.?([\d.]+)\s+Rs\.?([\d.]+)/i
    );

    if (!lineMatch) return null;

    const hsn = lineMatch[1];
    const quantity = Number(lineMatch[2]);
    const gross = Number(lineMatch[3]);
    const discount = Number(lineMatch[4]);
    const taxable = Number(lineMatch[5]);

    const sgstMatch = text.match(
      /SGST\s*@([\d.]+)%\s*:?\s*Rs\.?([\d.]+)/i
    );

    const cgstMatch = text.match(
      /CGST\s*@([\d.]+)%\s*:?\s*Rs\.?([\d.]+)/i
    );

    const sgstRate = sgstMatch ? Number(sgstMatch[1]) : 0;
    const sgstAmount = sgstMatch ? Number(sgstMatch[2]) : 0;

    const cgstRate = cgstMatch ? Number(cgstMatch[1]) : 0;
    const cgstAmount = cgstMatch ? Number(cgstMatch[2]) : 0;

    const grandMatch = text.match(
      /Total\s+Rs\.([\d.]+)\s+Rs\.([\d.]+)/i
    );

    const totalTax = grandMatch ? Number(grandMatch[1]) : 0;
    const grandTotal = grandMatch ? Number(grandMatch[2]) : 0;

    return {
      hsn,
      quantity,
      gross,
      discount,
      taxable_value: taxable,
      
        sgst_rate: sgstRate,
        sgst_amount: sgstAmount,
        cgst_rate: cgstRate,
        cgst_amount: cgstAmount,
      
      total_tax: totalTax,
      grand_total: grandTotal
    };
  }

  const description = extractProductDescription(clean);
  const pricing = extractProductPricing(clean);

  // ======================================
  // FINAL STRUCTURED OUTPUT
  // ======================================

  return {
    document_type: "credit_note",

    credit_note: {
      number: creditNoteNo,
      date: creditNoteDate
    },

    order: {
      order_number: orderNumber,
      order_date: orderDate
    },

    invoice: {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate
    },

    sold_by: {
      ...parseIndianAddress(soldBySection),
      gstin
    },

    bill_to: parseIndianAddress(billToSection),

    ship_to: parseIndianAddress(shipToSection),

    product: {
      description,
      ...pricing
    },

    extracted_at: new Date().toISOString()
  };
}
