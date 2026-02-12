import type {BillTo,CreditNoteMeta, Seller, ShipTo } from "./types"


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