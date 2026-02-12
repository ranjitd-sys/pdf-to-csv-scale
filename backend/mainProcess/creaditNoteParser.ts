import type {BillTo,CreditNoteMeta, OtherCharge, ParsedProduct, Seller, Ship, TaxDetail, } from "./types"


export function parseCreditNoteMeta(text: string): CreditNoteMeta {
  const orderNumber = text.match(/Order\s+Number:\s*(\S+)/i)?.[1]
  const orderDate = text.match(/Order\s+Date:\s*([\d-]+\s+[\d:]+)/i)?.[1]

  const creditNoteNo = text.match(/Credit\s+Note\s+No:\s*(\S+)/i)?.[1]
  const creditNoteDate = text.match(/Credit\s+Note\s+Date:\s*([\d-]+\s+[\d:]+)/i)?.[1]

  const invoiceMatch = text.match(
    /Invoice\s+No\s+and\s+Date:\s*(\S+)\s+([\d-]+\s+[\d:]+)/i
  )

  return {
    order_number: orderNumber,
    order_date: orderDate,
    credit_note_no: creditNoteNo,
    credit_note_date: creditNoteDate,
    invoice_no: invoiceMatch?.[1],
    invoice_date: invoiceMatch?.[2],
  }
}


export function extractSoldBy(text: string): Seller {
  const clean = text.replace(/\r/g, "").trim()

  const regex =
    /SOLD BY:\s*\n([^\n]+)\n([^,]+),\s*([^,]+),\s*(\d{6})\nGSTIN\s*:\s*([A-Z0-9]+)/i

  const match = clean.match(regex)

  if (!match) return null

  return {
    seller_name: match[1]!.trim(),
    seller_city: match[2]!.trim(),
    seller_state: match[3]!.trim(),
    seller_pincode: match[4] || "",
    seller_gstin: match[5] || "",
  }
}



export function extractBillTo(text: string):BillTo {
  const clean = text.replace(/\r/g, "").trim()

  // Extract name (line after BILL TO:)
  const nameMatch = clean.match(/BILL TO:\s*\n([^\n]+)/i)

  // Extract place of supply
  const placeMatch = clean.match(
    /Place of Supply\s*:\s*(\d+)\s+([A-Za-z\s]+)/i
  )

  return {
    Bill_name: nameMatch ? nameMatch[1]!.trim() : null,
    place_of_supply_code: placeMatch ? placeMatch[1]!.trim() : null,
    place_of_supply_state: placeMatch ? placeMatch[2]!.trim() : null,
  }
}


export function extractShipTo(text: string): Ship | null {
  const clean = text.replace(/\r/g, "").trim()

  // Capture block between SHIP TO: and SN. Description
  const blockMatch = clean.match(
    /SHIP TO:\s*\n([\s\S]*?)\nSN\./i
  )

  if (!blockMatch) return null
  if(blockMatch[1]  === undefined) return null;
  const lines = blockMatch[1]
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)

  if (lines.length < 2) return null

  const name = lines[0]

  // Full address except name
  const addressLines = lines.slice(1)

  const fullAddress = addressLines.join(" ")

  // Extract pincode (6 digit at end)
  const pincodeMatch = fullAddress.match(/(\d{6})/)

  const pincode = pincodeMatch ? pincodeMatch[1] : ""

  // Extract city + state from last line before pincode
  const cityStateMatch = fullAddress.match(
    /,\s*([^,]+),\s*([^,]+),\s*\d{6}/
  )

  const city = cityStateMatch ? cityStateMatch[1]!.trim() : ""
  const state = cityStateMatch ? cityStateMatch[2]!.trim() : ""

  return {
    ship_name: name || " ",
    ship_address: fullAddress,
    ship_city: city,
    ship_state: state,
    ship_pincode: pincode || "",
  }
}




export function ExtractProduct(rawText: string): ParsedProduct {
  // Remove unwanted heading
  const cleaned = rawText.replace(/^Taxes Total\s*/i, '').trim()

  const regex =
    /(\d+)\s+([\s\S]+?)\n(\d+)\s+(\d+)\s+(Rs\.\d+\.\d{2})\s+(Rs\.\d+\.\d{2})\s+(Rs\.\d+\.\d{2})$/

  const match = cleaned.match(regex)

  if (!match) return null

  return {
    quantity: Number(match[1]),
    name: match[2]!.replace(/\n/g, ' ').trim(),
    sku: match[3] || "",
    quantity_confirm: Number(match[4]),
    unit_price: Number(match[5]!.replace("Rs.", "")),
    discount: Number(match[6]!.replace("Rs.", "")),
    taxable_value: Number(match[7]!.replace("Rs.", "")),
  }
}

export function parseTaxSection(text: string) {
  const result = {
    igst: null as TaxDetail | null,
    sgst: null as TaxDetail | null,
    cgst: null as TaxDetail | null,
    other_charges: null as OtherCharge | null,
    total_tax: null as number | null,
    grand_total: null as number | null,
  }

  // ---------------- IGST ----------------
  const igstMatch = text.match(
    /IGST\s*@\s*(\d+\.?\d*)%\s*:Rs\.(\d+\.\d{2})/
  )

  if (igstMatch) {
    result.igst = {
      rate: Number(igstMatch[1]),
      amount: Number(igstMatch[2]),
    }
  }

  // ---------------- SGST ----------------
  const sgstMatch = text.match(
    /SGST\s*@\s*(\d+\.?\d*)%\s*:Rs\.(\d+\.\d{2})/
  )

  if (sgstMatch) {
    result.sgst = {
      rate: Number(sgstMatch[1]),
      amount: Number(sgstMatch[2]),
    }
  }

  // ---------------- CGST ----------------
  const cgstMatch = text.match(
    /CGST\s*@\s*(\d+\.?\d*)%\s*:Rs\.(\d+\.\d{2})/
  )

  if (cgstMatch) {
    result.cgst = {
      rate: Number(cgstMatch[1]),
      amount: Number(cgstMatch[2]),
    }
  }

  // ---------------- OTHER CHARGES ----------------
  const otherChargesMatch = text.match(
    /(\d+)\s+OTHER CHARGES\s+(\d+)\s+NA\s+Rs\.(\d+\.\d{2})\s+\d+\s+Rs\.(\d+\.\d{2})\s+(IGST|SGST|CGST)\s*@\s*(\d+\.?\d*)%\s*:Rs\.(\d+\.\d{2})\s+Rs\.(\d+\.\d{2})/
  )

  if (otherChargesMatch) {
    result.other_charges = {
      line_no: Number(otherChargesMatch[1]),
      description: "OTHER CHARGES",
      code: otherChargesMatch[2] || "",
      unit_price: Number(otherChargesMatch[3]),
      taxable_value: Number(otherChargesMatch[4]),
      tax_type: otherChargesMatch[5] || "",
      tax_rate: Number(otherChargesMatch[6]),
      tax_amount: Number(otherChargesMatch[7]),
      line_total: Number(otherChargesMatch[8]),
    }
  }

  // ---------------- TOTAL ----------------
  const totalMatch = text.match(
    /Total\s+Rs\.(\d+\.\d{2})\s+Rs\.(\d+\.?\d*)/
  )

  if (totalMatch) {
    result.total_tax = Number(totalMatch[1])
    result.grand_total = Number(totalMatch[2])
  }

  return result
}