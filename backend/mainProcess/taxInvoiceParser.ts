// documentParser.ts

import { extractIndianState } from "./state";

export function extractDocument(text: string) {
  const clean = text.replace(/\r/g, "").trim();

  const isCreditNote = /Credit\s*Note/i.test(clean);
  const isTaxInvoice = /Tax\s*Invoice/i.test(clean);

  // =====================================================
  // BASIC FIELD EXTRACTION
  // =====================================================

  const orderNumber = clean.match(/Order\s*Number[:\n\s]+(\S+)/i)?.[1] || null;

  const orderDate =
    clean.match(/Order\s*Date[:\n\s]+([0-9:\-\s]+)/i)?.[1]?.trim() || null;

  const creditNoteNo =
    clean.match(/Credit\s*Note\s*No[:\s]+(\S+)/i)?.[1] || null;

  const creditNoteDate =
    clean.match(/Credit\s*Note\s*Date[:\s]+([0-9:\-\s]+)/i)?.[1]?.trim() ||
    null;

  const invoiceNumber =
    clean.match(/Invoice\s*(No|Number)[:\n\s]+(\S+)/i)?.[2] || null;

  const invoiceDate =
    clean.match(/Invoice\s*Date[:\n\s]+([0-9:\-\s]+)/i)?.[1]?.trim() || null;

  const gstin =
    clean.match(/\b[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][0-9A-Z]Z[0-9A-Z]\b/)?.[0] ||
    null;

  // =====================================================
  // SECTION EXTRACTOR
  // =====================================================

  function extractSection(start: string, end: string) {
    const regex = new RegExp(`${start}([\\s\\S]*?)${end}`, "i");
    return clean.match(regex)?.[1]?.trim();
  }

  const billToSection = extractSection("BILL TO:", "SHIP TO:");
  const shipToSection =
    extractSection("SHIP TO:", "Order Date") ||
    extractSection("SHIP TO:", "SN\\.");

  const soldBySection =
    extractSection("SOLD BY:", "BILL TO:") ||
    clean.match(/Sold by:\s*([\s\S]*?)\nTax/i)?.[1]?.trim();

  // =====================================================
  // ADDRESS PARSER
  // =====================================================

  function parseIndianAddress(section?: string) {
    if (!section) {
      return {
        name: null,
        address_line: null,
       
        state: null,
        pincode: null,
      };
    }

    const lines = section
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean)
      .filter((l) => !/GSTIN/i.test(l));

    const name = lines[0] || null;

    const stateLine = lines.find((l) => /\d{6}/.test(l));

    let city: string | null = null;
    let state: string | null = null;
    let pincode: string | null = null;

    if (stateLine) {
      const match = stateLine.match(/(.+?),?\s*([^,]+)\s*(\d{6})/);
      if (match) {
        
        state = extractIndianState(text)
        pincode = match[3] || null;
      }
    }

    const addressLines = lines.slice(1).filter((l) => l !== stateLine);

    return {
      name,
      address_line: addressLines.join(" ") || null,
      city,
      state,
      pincode,
    };
  }

function extractProductDescription(text: string): string | null | undefined {
  const clean = text.replace(/\r/g, "").trim();

  const match = clean.match(/\b1\s(.+)/);
  if(match === null) return;
  if(match[1] === undefined) return;
  return match ? match[1].trim() : null;
}



  // =====================================================
  // MULTI PRODUCT PARSER (Serial Based)
  // =====================================================

  function extractProducts(text: string) {
    const lines = text.split("\n");
    const items: any[] = [];
    let currentBlock: string[] = [];

    function processBlock(blockLines: string[]) {
      const blockText = blockLines.join("\n");

      const pricingMatch = blockText.match(
        /(\d{6})\s+(NA|\d+)\s+Rs\.?([\d.]+)\s+Rs\.?([\d.]+)\s+Rs\.?([\d.]+)/i,
      );

      if (!pricingMatch) return;

      const sgstMatch = blockText.match(
        /SGST\s*@([\d.]+)%\s*:?\s*Rs\.?([\d.]+)/i,
      );

      const cgstMatch = blockText.match(
        /CGST\s*@([\d.]+)%\s*:?\s*Rs\.?([\d.]+)/i,
      );

      items.push({
        desciption: extractProductDescription(text),
        hsn: pricingMatch[1] || null,
        quantity: pricingMatch[2] === "NA" ? null : Number(pricingMatch[2]),
        gross: Number(pricingMatch[3]) || null,
        discount: Number(pricingMatch[4]) || null,
        taxable_value: Number(pricingMatch[5]) || null,
        sgst_rate: sgstMatch ? Number(sgstMatch[1]) : null,
        sgst_amount: sgstMatch ? Number(sgstMatch[2]) : null,
        cgst_rate: cgstMatch ? Number(cgstMatch[1]) : null,
        cgst_amount: cgstMatch ? Number(cgstMatch[2]) : null,
      });
    }

    for (let line of lines) {
      if (/^\d+\s/.test(line.trim())) {
        if (currentBlock.length > 0) {
          processBlock(currentBlock);
          currentBlock = [];
        }
      }

      if (currentBlock.length > 0 || /^\d+\s/.test(line.trim())) {
        currentBlock.push(line);
      }
    }

    if (currentBlock.length > 0) {
      processBlock(currentBlock);
    }

    return items;
  }

  const items = extractProducts(clean);

  // =====================================================
  // TOTALS
  // =====================================================

  const totalMatch = clean.match(/Total\s+Rs\.([\d.]+)\s+Rs\.([\d.]+)/i);

  const totalTax = totalMatch ? Number(totalMatch[1]) : null;
  const grandTotal = totalMatch ? Number(totalMatch[2]) : null;

  // =====================================================
  // FINAL STRUCTURE (UNIFIED)
  // =====================================================

  return {
    document_type: isCreditNote
      ? "credit_note"
      : isTaxInvoice
        ? "tax_invoice"
        : "unknown",

    credit_note: {
      number: creditNoteNo,
      date: creditNoteDate,
    },

    order: {
      order_number: orderNumber,
      order_date: orderDate,
    },

    invoice: {
      invoice_number: invoiceNumber,
      invoice_date: invoiceDate,
    },

    sold_by: {
      ...parseIndianAddress(soldBySection),
      gstin,
    },

    bill_to: parseIndianAddress(billToSection),

    ship_to: parseIndianAddress(shipToSection),

    product: items.length > 0 ? items : null,

    total_tax: totalTax,
    grand_total: grandTotal,

    extracted_at: new Date().toISOString(),
  };
}
