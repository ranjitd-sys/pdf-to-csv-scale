import { Effect } from "effect";

type CreditNoteSections = {
  credit_note?: string;
  sold_by?: string;
  bill_to?: string;
  ship_to?: string;
  taxes?: string;
  product?: string;
};
type InvoiceType = {
  Bill_detail: string | undefined;
  ship_to: string | undefined;
  order: string | undefined;
  product: string | undefined;
  taxes: string | undefined;
  sold_by: string | undefined;
};

export const separateCreditNote = (text: string) => Effect.gen(function *() {
  function extractBetween(start: string | RegExp, end?: string | RegExp) {
    const endPattern = typeof end === "string" ? end : end?.source;
    const startPattern = typeof start === "string" ? start : start?.source;
    const pattern = end
      ? new RegExp(`${startPattern}[\\s\\S]*?(?=${endPattern})`, "i")
      : new RegExp(`${startPattern}[\\s\\S]*`, "i");

    const match = text.match(pattern);
    return match ? match[0].trim() : undefined;
  }

  return {
    credit_note: extractBetween("Credit Note", "SOLD BY"),
    sold_by: extractBetween("SOLD BY", "BILL TO"),
    bill_to: extractBetween("BILL TO", "SHIP TO"),
    ship_to: extractBetween("SHIP TO", "Taxes Total"),
    product: extractBetween("Taxes Total", /(SGST|CGST|IGST)/),
    taxes: extractBetween(/(SGST|CGST|IGST)/),
  };
})

export const separateTaxInvoice = (text: string) => Effect.gen(function* () {


  function extractBetween(start: string | RegExp, end?: string | RegExp) {
    const endPattern = typeof end === "string" ? end : end?.source;
    const startPattern = typeof start === "string" ? start : start?.source;
    const pattern = end
      ? new RegExp(`${startPattern}[\\s\\S]*?(?=${endPattern})`, "i")
      : new RegExp(`${startPattern}[\\s\\S]*`, "i");

    const match = text.match(pattern);
    return match ? match[0].trim() : undefined;
  }

  return {
    Bill_detail: extractBetween("BILL TO", "SHIP TO"),

    ship_to: extractBetween("SHIP TO", "Order Date"),

    order: extractBetween("Order Date", "Amount"),

    product: extractBetween("Amount", /(SGST|CGST|IGST)/),
    taxes: extractBetween(/(SGST|CGST|IGST)/, "Terms & Conditions"),
    sold_by: extractBetween(
      "Terms & Conditions",
      "Tax is not payable on reverse charge basis",
    ),
  };
})
