// invoice-parser.ts

// -----------------------------
// TYPES
// -----------------------------

// -----------------------------
// HELPERS
// -----------------------------

function clean(text: string): string {
  return text.replace(/\r/g, "").trim();
}

function matchField(text: string, label: string): string {
  const regex = new RegExp(label + "\\s*:?\\s*([^\n]+)", "i");
  const match = text.match(regex);
  return match ? match[1]!.trim() : "";
}

function extractBlock(text: string, start: string, end: string) {
  const regex = new RegExp(start + "([\\s\\S]*?)" + end, "i");
  const match = text.match(regex);

  if (match === null) return;
  if (match[1] === null) return;
  return match ? clean(match[1] || "") : "";
}

function extractState(address: string): string {
  const states =
    /(Andhra Pradesh|Tamil Nadu|Karnataka|Kerala|Maharashtra|Delhi|Gujarat|Telangana|Rajasthan|Punjab|Haryana|Bihar|Odisha|West Bengal)/i;

  const match = address.match(states);
  return match ? match[0] : "";
}

function extractPincode(address: string): string {
  const match = address.match(/\b\d{6}\b/);
  return match ? match[0] : "";
}

function parseIndianAddress(block: string) {
  const lines = block.split("\n").filter(Boolean);

  const name = lines[0] || "";
  const address = lines.slice(1).join(" ").trim();

  return {
    name,
    address,
    state: extractState(address),
    pincode: extractPincode(address),
  };
}

// -----------------------------
// MAIN PARSER
// -----------------------------

export function parseDocument(text: string) {
  text = clean(text);

  // -----------------------------
  // DOCUMENT TYPE
  // -----------------------------

  const document_type = text.includes("Credit Note")
    ? "credit_note"
    : "invoice";

  // -----------------------------
  // BASIC FIELDS
  // -----------------------------

  const invoiceNumber = matchField(text, "Invoice Number");
  const invoiceDate = matchField(text, "Invoice Date");

  const orderNumber = matchField(text, "Order Number");
  const orderDate = matchField(text, "Order Date");

  const creditNoteNo = matchField(text, "Credit Note Number");
  const creditNoteDate = matchField(text, "Credit Note Date");

  // -----------------------------
  // ADDRESS SECTIONS
  // -----------------------------

  const billToSection = extractBlock(text, "BILL TO:", "Place of Supply");
  const shipToSection = extractBlock(text, "SHIP TO:", "Order Date");
  const soldBySection = extractBlock(text, "Sold by:", "Tax is not payable");

  const gstinMatch = soldBySection?.match(/\b[0-9A-Z]{15}\b/);
  const gstin = gstinMatch ? gstinMatch[0] : "";

  // -----------------------------
  // PRODUCT EXTRACTION (FIRST ITEM)
  // -----------------------------

  const itemRegex =
    /1\s+([\s\S]*?)\s+(\d{6})\s+(\d+|NA)\s+Rs\.([\d.]+)\s+(Rs\.?[\d.]+|0)\s+Rs\.([\d.]+)\s+SGST\s*@([\d.]+)%\s*:Rs\.([\d.]+)\s+CGST\s*@([\d.]+)%\s*:Rs\.([\d.]+)\s+Rs\.([\d.]+)/;

  const match = text.match(itemRegex);

  const description = match ? match[1]?.trim() : "";
  const hsn = match ? match[2] : "";
  const quantity = match ? match[3] : "";
  const gross_amount = match ? match[4] : "";
  const discount = match ? match[5]?.replace("Rs.", "").trim() : "";
  const taxable_value = match ? match[6] : "";
  const sgst_rate = match ? match[7] : "";
  const sgst_amount = match ? match[8] : "";
  const cgst_rate = match ? match[9] : "";
  const cgst_amount = match ? match[10] : "";
  const total = match ? match[11] : "";

  // -----------------------------
  // RETURN STRUCTURE
  // -----------------------------

  return {
    document_type,

    CreditNumber: creditNoteNo,
    CreditDate: creditNoteDate,

    order_number: orderNumber,
    order_date: orderDate,

    invoice_number: invoiceNumber,
    invoice_date: invoiceDate,

    ...parseIndianAddress(soldBySection || ""),
    gstin,

    ...parseIndianAddress(billToSection || ""),

    ...parseIndianAddress(shipToSection || ""),

    description,
    hsn,
    quantity,
    gross_amount,
    discount,
    taxable_value,
    sgst_rate,
    sgst_amount,
    cgst_rate,
    cgst_amount,
    total,

    extracted_at: new Date().toISOString(),
  };
}
