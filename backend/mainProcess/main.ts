import { Effect, Schema } from "effect";
import { readdir } from "fs/promises";
import { join } from "path";
import { extractText } from "unpdf";
const traced =
  (name: string, attributes?: Record<string, unknown>) =>
  <A, E, R>(effect: Effect.Effect<A, E, R>) =>
    effect.pipe(Effect.withSpan(name, { attributes }));

import {
  parseCreditNoteMeta,
  extractSoldBy,
  extractBillTo,
  extractShipTo,
  ExtractProduct,
  parseTaxSection,
} from "./creaditNoteParser";

import { separateCreditNote, separateTaxInvoice } from "./shaprator";

import {
  extractInvoice,
  extractInvoiceDates,
  extractSellerDetails,
  InvoiceextractProduct,
  invoiceExtractShip,
} from "./TaxInvoiceParser";
import {
  CreditNotesArraySchema,
  InvoiceArraySchema,
} from "./schema";
import { ParseError } from "effect/ParseResult";
export const Process = Effect.gen(function* () {
  const folderPath = "./out";
  let TaxInvoiceCount = 0;
  let CreditNoteCount = 0;
  const files = yield* traced("Read_Directory")(
    Effect.promise(() => readdir(folderPath)),
  );
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"));

  if (pdfFiles.length === 0) {
    return yield* Effect.fail(new Error("No PDF files found"));
  }

  const allTextBlocks = yield* Effect.forEach(
    pdfFiles,
    (pdf) =>
      Effect.gen(function* () {
        const filePath = join(folderPath, pdf);

        const buffer = yield* traced("Read_PDF_File", {
          file: filePath,
        })(Effect.promise(() => Bun.file(filePath).arrayBuffer()));

        const raw = yield* traced("Extract_Text", {
          file: filePath,
        })(Effect.promise(() => extractText(buffer)));

        return raw.text;
      }),
    { concurrency: 4 },
  );

  //Because it return sting array of array need to get rid of that one array
  const flatText = allTextBlocks.flat();

  const result = yield* Effect.forEach(
    flatText,
    (data, index) =>
      Effect.gen(function* () {
        let failedInvoices :any = [];
        let passedInvoices = [];
        const clean = data.replace(/\r/g, "").trim();
        const isCredit = clean.includes("Credit Note");

        return yield* Effect.gen(function* () {
          if (isCredit) {
            const res = yield* traced("Shaparate_Credit_Not")(
              separateCreditNote(clean),
            );

            const Credit_Note = parseCreditNoteMeta(res.credit_note || "");
            const Sold = extractSoldBy(res.sold_by || "");
            const Bill = extractBillTo(res.bill_to || "");
            const Ship = extractShipTo(res.ship_to || "");
            const Product = ExtractProduct(res.product || "");
            const tax = parseTaxSection(res.taxes || "");

            const result = {
              ...Credit_Note,
              ...Sold,
              ...Bill,
              ...Ship,
              ...Product,
              ...tax,
            };
            {

            
            // const total_tax = tax.total_tax || 0;
            // const taxableProductPrice = Product?.taxable_value || 0;

            // if(tax.other_charges){

            //   // console.log(taxableProductPrice,( taxableProductPrice + total_atax + tax.other_charges.taxable_value), tax.grand_total);
            // }
            // else{
            //   // console.log(taxableProductPrice + total_tax, tax.grand_total)
            // }

          /// validatin Data
            // const Invoices = {
            //   creditNote:Credit_Note.credit_note_no,
            //   Product: Product,
            //   tax: {
            //     other_charges: tax.other_charges,
            //     total_tax: tax.total_tax,
            //     grand_total: tax.grand_total,
            //   },
            // };
          // validating 

            
            
            // Schema.decodeUnknown(
            //   TaxInvoiceValidation,
            // )(Invoices).pipe(Effect.either);

            // Checking wehther it is valid or not
            // if (validateCorrectInvoice._tag === "Left") {
            //   const formatError = new ParseError(validateCorrectInvoice.left);
              
            //   yield* Effect.sync(() => {
            //     failedInvoices.push({
            //       CrditnoteNumber: Invoices.creditNote ?? "#00000",
            //       reason: formatError,
            //     });
            //   });
            // }
            // else{
            //   passedInvoices.push(validateCorrectInvoice.right.creditNote)
            // }
}

            return { type: "Credit", data: result };
          } else {
            const clean = data.replace(/\r/g, "").trim();

            const res = yield* separateTaxInvoice(clean);
            const bill = extractInvoice(res.Bill_detail || "");
            const shipInfo = invoiceExtractShip(res.ship_to || "");
            const product = InvoiceextractProduct(res.product || "");
            const tax = parseTaxSection(res.taxes || "");
            const seller = extractSellerDetails(res.sold_by || "");
            const InvoiceDates = extractInvoiceDates(res.order || "");

            const result = {
              ...bill,
              ...shipInfo,
              ...product,
              ...seller,
              ...tax,
              ...InvoiceDates,
            };
            if(tax.other_charges){
             console.log(Number(product?.product_taxable_value )+ (tax?.total_tax ?? 0)  + (tax.other_charges.taxable_value),  tax.grand_total);
            }
            else {

              console.log(Number(product?.product_taxable_value )+ (tax?.total_tax ?? 0),  tax.grand_total);
            }
            console.log("==========New Line==========")
            return { type: "invoice", data: result };
          }
        }).pipe(
          Effect.withSpan("Process_Document", {
            attributes: {
              document_index: index,
              document_type: isCredit ? "Credit" : "Invlice",
              text_lenght: clean.length,
            },
          }),
        );
      }),

    { concurrency: 5 },
  );
  const TotalCreditNotes = result
    .filter((creditNote) => creditNote.type === "Credit")
    .map((creditNotes) => creditNotes?.data);

  const ToalTaxInvoice = result
    .filter((taxInvoice) => taxInvoice.type === "invoice")
    .map((taxInvoide) => taxInvoide.data);

  CreditNoteCount = TotalCreditNotes.length;
  TaxInvoiceCount = ToalTaxInvoice.length;

  console.log("Tax Invoice ", TaxInvoiceCount);
  console.log("Credit Note", CreditNoteCount);

  yield* Effect.annotateCurrentSpan({
    "credit_note.count": CreditNoteCount,
    "tax_invoice.count": TaxInvoiceCount,
  });

  // all Schema Validation
  
  // const CreditValidate = yield* Schema.decodeUnknown(CreditNotesArraySchema)(
  //   TotalCreditNotes,
  // ).pipe(Effect.mapError(() => new Error("Invalid Credit Note Data")));
  const [error, CreditValidate] = yield* Effect.partition(
   TotalCreditNotes,
   (creditNote) =>
     Schema.decodeUnknown(CreditNotesArraySchema)(TotalCreditNotes).pipe(
       Effect.map((validData) => ({
         validData
       })),

       Effect.mapError((error) => ({
        message:"Invalid Credit Note",
         creditNoteNumber: creditNote.order_number,
         error
       }))
     )
 );
  
  const [TaxInerror, TaxInvoiceValidate] = yield* Effect.partition(
    ToalTaxInvoice, 
    (taxInvices) => Schema.decodeUnknown(InvoiceArraySchema)(ToalTaxInvoice).pipe(
      Effect.map((validData) => ({
        validData,
      }) ),
      Effect.mapError((error)=>({
        message:"Invalid Tax Invoice",
        TaxInviceNumber: taxInvices.order_date,
        error,
        
      }))
    )
  )



  return {

    TaxInvoiceCount,
    CreditNoteCount,
    CreditValidate,
    TaxInvoiceValidate,
    
  };
}).pipe(
  Effect.withSpan("PDF_Processing_Pipeline", {
    attributes: { "peer.service": "DocumentProcessor" },
  }),
);
const data = await Effect.runPromise(Process);
// console.log(data)
