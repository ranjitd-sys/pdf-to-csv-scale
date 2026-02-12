import type {BillTo,CreditNoteMeta, OtherCharge, ParsedProduct, Seller, Ship, TaxDetail, } from "./Credittypes"


export function parseCreditNoteMeta(text: string): CreditNoteMeta {
  const orderNumber = text.match(
    /(Purchase\s+)?Order\s+Number\s*:\s*(\S+)/i
  )?.[2]

  const orderDate = text.match(
    /Order\s+Date\s*:\s*([\d-]+\s+[\d:]+)/i
  )?.[1]

  const creditNoteNo = text.match(
    /Credit\s+Note\s+(No|Number)\s*:\s*(\S+)/i
  )?.[2]

  const creditNoteDate = text.match(
    /Credit\s+Note\s+Date\s*:\s*([\d-]+\s+[\d:]+)/i
  )?.[1]

  const invoiceMatch = text.match(
    /Invoice\s+No\s+and\s+Date\s*:\s*(\S+)\s+([\d-]+\s+[\d:]+)/i
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


export function extractShipTo(text: string) {
  const block = text.split(/SHIP TO:/g)[1]
  if (!block) return null

  const cleaned = block.split(/SN\.\s*Description/i)[0]!.trim()

  const lines = cleaned
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)

  if (!lines.length) return null

  const ship_name = lines[0]
  const fullText = lines.slice(1).join(" ")

  const match = fullText.match(/([A-Za-z\s]+),\s*(\d{6})\b/)

  let ship_state = ""
  let ship_pincode = ""
  let ship_city = ""
  let ship_address = fullText

  if (match) {
    ship_state = match[1]!.trim()
    ship_pincode = match[2] || ""

    ship_address = fullText.replace(match[0], "").trim()

    const cityMatch = ship_address.match(/,\s*([^,]+)\s*$/)
    if (cityMatch) {
      
      ship_address = ship_address.replace(/,\s*([^,]+)\s*$/, "").trim()
    }
  }

  return {
    ship_name,
    ship_address,
    ship_state,
    ship_pincode,
  }
}



export function ExtractProduct(rawText: string): ParsedProduct | null {
  if (!rawText) return null

  const cleaned = rawText
    .replace(/Taxes\s+Total/i, "")
    .replace(/\r/g, "")
    .trim()

  /**
   * Supports:
   * - With discount
   * - Without discount
   * - Multiline product names
   * - Flexible spacing
   */

  const regex =
    /^\s*(\d+)\s+([\s\S]+?)\s+(\d{5,})\s+(\d+)\s+Rs\.?\s?(\d+\.\d{2})(?:\s+Rs\.?\s?(\d+\.\d{2}))?\s+Rs\.?\s?(\d+\.\d{2})?\s*$/

  const match = cleaned.match(regex)

  if (!match) return null

  const quantity = Number(match[1])
  const name = match[2]!.replace(/\s+/g, " ").trim()
  const sku = match[3] || ""
  const quantity_confirm = Number(match[4])

  const firstPrice = Number(match[5])
  const secondPrice = match[6] ? Number(match[6]) : null
  const thirdPrice = match[7] ? Number(match[7]) : null

  return {
    quantity,
    name,
    sku,
    quantity_confirm,
    unit_price: firstPrice,
    discount: thirdPrice ? secondPrice ?? 0 : 0,
    taxable_value: thirdPrice ?? secondPrice ?? 0,
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