type CreditNoteSections = {
  credit_note?: string
  sold_by?: string
  bill_to?: string
  ship_to?: string
  taxes?: string
}

export function separateCreditNote(text: string): CreditNoteSections {
  function extractBetween(start: string, end?: string) {
    const pattern = end
      ? new RegExp(`${start}[\\s\\S]*?(?=${end})`, "i")
      : new RegExp(`${start}[\\s\\S]*`, "i")

    const match = text.match(pattern)
    return match ? match[0].trim() : undefined
  }

  return {
    credit_note: extractBetween("Credit Note", "SOLD BY"),
    sold_by: extractBetween("SOLD BY", "BILL TO"),
    bill_to: extractBetween("BILL TO", "SHIP TO"),
    ship_to: extractBetween("SHIP TO", "Taxes Total"),
    taxes: extractBetween("Taxes Total")
  }
}
