import type { InvoiceData } from "./InvoiceType"

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
    address,
    state,
    pincode,
    place_of_supply_code: placeMatch?.[1],
    place_of_supply_state: placeMatch?.[2]?.trim(),
  }
}
