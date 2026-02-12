import type { InvoiceData,InvoiceDates,Product,Seller,Ship } from "./InvoiceType"

export function extractInvoice(text: string): InvoiceData | null {
  const clean = text.replace(/\r/g, "").trim()

  const orderMatch = clean.match(/Order Number\s*\n\s*(\d{12,})/)
  const invoiceMatch = clean.match(/Invoice Number\s*\n\s*(\S+)/)
  const billToMatch = clean.match(/BILL TO:\s*\n([\s\S]*?)Place of Supply/i)
  const placeMatch = clean.match(/Place of Supply\s*:\s*(\d+)\s+([A-Za-z ]+)/)

  let name = ""
  let address = ""
  let state = ""
  let pincode = ""

  if (billToMatch) {
    const billBlock = billToMatch[1]!.trim()

    const lines = billBlock
      .split("\n")
      .map(l => l.trim())
      .filter(Boolean)

    name = lines[0] || ""
    address = lines.slice(1).join(" ")

    const statePinMatch = address.match(/([A-Za-z ]+),\s*(\d{6})/)
    if (statePinMatch) {
      state = statePinMatch[1]!.trim()
      pincode = statePinMatch[2] || ""
    }
  }

  return {
    order_number: orderMatch?.[1],
    invoice_number: invoiceMatch?.[1],
    bill_to_name: name,
    bill_to_address : address,
    bill_to_state:state,
    bill_to_pincode:pincode,
    place_of_supply_code: placeMatch?.[1],
    place_of_supply_state: placeMatch?.[2]?.trim(),
  }
}




export function invoiceExtractShip(text: string): Ship  {
  const block = text.split("SHIP TO:")[1]
  if (!block) return null

  const lines = block
    .trim()
    .split("\n")
    .map(l => l.trim())
    .filter(Boolean)

  const name = lines[0] || ""
  const lastLine = lines[lines.length - 1] || ""

  const locationMatch = lastLine.match(
    /([^,]+),\s*([^,]+),\s*(\d{6})/
  )

  const city = locationMatch?.[1]?.trim() || ""
  const state = locationMatch?.[2]?.trim() || ""
  const pincode = locationMatch?.[3] || ""

  const address = lines
    .slice(1, lines.length - 1)
    .join(" ")
    .replace(/\s+/g, " ")
    .trim()

  return {
    ship_name: name,
    ship_address: address,
    ship_city: city,
    ship_state: state,
    ship_pincode: pincode,
  }
}

export function InvoiceextractProduct(text: string): Product {
  const clean = text.replace(/\r/g, "").trim()

  const regex =
    /(\d+)\s+([\s\S]+?)\n(\d+)\s+(\d+)\s+Rs\.(\d+\.\d{2})\s+Rs\.(\d+\.\d{2})\s+Rs\.(\d+\.\d{2})/

  const match = clean.match(regex)
  if (!match) return null

  return {
    product_sn: match[1] || "",
    product_name: match[2]!.replace(/\s+/g, " ")!.trim(),
    product_hsn: match[3] || "",
    product_qty: match[4] || "",
    product_gross: match[5]||"",
    product_discount: match[6]||"",
    product_taxable_value: match[7]||"",
  }
}




export function extractSellerDetails(text: string): Seller | null {
  const clean = text
    .replace(/\r/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()

  // Remove Terms & Conditions
  const filtered = clean.replace(/Terms\s*&\s*Conditions:\s*/i, "")

  // Seller Name
  const sellerMatch = filtered.match(/Sold\s+by:\s*(.+)/i)

  // Address Block
  const addressMatch = filtered.match(
    /Sold\s+by:\s*.+?\n(.+?),\s*([A-Za-z\s]+),\s*([A-Za-z\s]+)\s*(\d{6})/i
  )

  // 🔥 Bulletproof GST Extraction
  const normalized = filtered.replace(/\s+/g, "").toUpperCase()
  const gstMatch = normalized.match(/\d{2}[A-Z]{5}\d{4}[A-Z]\d[A-Z0-9]/)

  if (!sellerMatch || !addressMatch) return null

  return {
    seller_name: sellerMatch[1]!.trim(),
    address: addressMatch[1]!.trim(),
    city: addressMatch[2]!.trim(),
    state: addressMatch[3]!.trim(),
    pincode: addressMatch[4] || "",
    gstin: gstMatch ? gstMatch[0] : null
  }
}

export function extractInvoiceDates(text: string): InvoiceDates | null {
  const clean = text.replace(/\r/g, "").trim()

  const orderMatch = clean.match(
    /Order\s*Date\s*\n?\s*([\d-]{10}\s+[\d:]{8})/i
  )

  const invoiceMatch = clean.match(
    /Invoice\s*Date\s*\n?\s*([\d-]{10}\s+[\d:]{8})/i
  )

  return {
    order_date: orderMatch ? orderMatch[1] :undefined ,
    invoice_date: invoiceMatch ? invoiceMatch[1] : undefined
  }
}

