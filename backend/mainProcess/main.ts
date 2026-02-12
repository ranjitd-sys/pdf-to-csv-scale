import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join, normalize } from "path";
import { extractText } from "unpdf";
import { parseCreditNoteMeta, extractSoldBy, extractBillTo, extractShipTo, ExtractProduct, parseTaxSection } from "./creaditNoteParser";
import { separateCreditNote, separateTaxInvoice } from "./shaprator";
import { extractInvoice, extractInvoiceDates, extractSellerDetails, InvoiceextractProduct, invoiceExtractShip } from "./TaxInvoiceParser";


export const Process = Effect.gen(function* () {
  const folderPath = "./out";
  let TaxInvoiceCount = 0;
  let CreditNoteCount = 0;
  let CrediNotes :any[] = [];
  let TaxInvoice : any[] = [];
  const files = yield* Effect.promise(() => readdir(folderPath));
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  for (const pdf of pdfFiles) {
    const filePath = join(folderPath, pdf);

    const data = yield* Effect.promise(() => Bun.file(filePath).arrayBuffer());

    const rawBytes = yield* Effect.promise(() => extractText(data));
    rawBytes.text.map((data) => {
      if (data.includes("Credit Note")) {
        
        const res = separateCreditNote(data);
        const Credit_Note = parseCreditNoteMeta(res.credit_note || "");
        const Sold = extractSoldBy(res.sold_by|| "");
        const Bill = extractBillTo(res.bill_to|| "");
        const Ship = extractShipTo(res.ship_to || "");
        const Product = ExtractProduct(res.product || "");
        const tax  = parseTaxSection(res.taxes || "")
        
        const TotalCreditNotes = {
          ...Credit_Note,
          ...Sold,
          ...Bill,
          ...Ship,
          ...Product,
          ...tax
        }

       
        // console.log(Product)
        CrediNotes.push(TotalCreditNotes);
        console.log(TotalCreditNotes)
        CreditNoteCount++;
      } else {
     
        rawBytes.text.map(data => {
          const res = separateTaxInvoice(data);
          const bill = extractInvoice(res.Bill_detail || "");
          const shipInfo = invoiceExtractShip(res.ship_to || "");
          const product = InvoiceextractProduct(res.product || "");
          const tax = parseTaxSection(res.taxes || "");
          const seller = extractSellerDetails(res.sold_by || "");
          const InvoiceDates = extractInvoiceDates(res.order || "")

          const Invoices = {
            ...bill,
            ...shipInfo,
            ...product,
            ...seller,
            ...tax,
            ...InvoiceDates
          }
          
          TaxInvoice.push(Invoices);
          // console.log(Invoices)
          // console.log(res.sold_by)
        })
        TaxInvoiceCount++;
      }
      
    });
  }
  console.log("Tax Invoice ",TaxInvoiceCount);
  console.log("Credit Note",CreditNoteCount);
  return {CrediNotes,TaxInvoice};
});

