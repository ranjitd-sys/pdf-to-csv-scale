import { writeFile } from "fs/promises";
import { stringify } from "csv-stringify/sync";
import { Effect } from "effect";
import { Process } from "./process";

const invoices = await Effect.runPromise(Process); // your array

function flattenInvoice(inv: any) {
  return {
    document_type: inv.document_type,
    credit_number: inv.CreditNumber,
    credit_date: inv.CreditDate,

    order_number: inv.order_number,
    order_date: inv.order_date,
    invoice_number: inv.invoice_number,
    invoice_date: inv.invoice_date,

    seller_name: inv.name,
    seller_address: inv.address,
    seller_state: inv.state,
    seller_pincode: inv.pincode,
    seller_gstin: inv.gstin,

    bill_to_name: inv.bill_to?.name,
    bill_to_address: inv.bill_to?.address,
    bill_to_state: inv.bill_to?.state,
    bill_to_pincode: inv.bill_to?.pincode,

    ship_to_name: inv.ship_to?.name,
    ship_to_address: inv.ship_to?.address,
    ship_to_state: inv.ship_to?.state,
    ship_to_pincode: inv.ship_to?.pincode,

    description: inv.description?.replace(/\n/g, " "),
    hsn: inv.hsn,
    quantity: inv.quantity,
    gross_amount: inv.gross_amount,
    discount: inv.discount,
    taxable_value: inv.taxable_value,

    sgst_rate: inv.sgst_rate,
    sgst_amount: inv.sgst_amount,
    cgst_rate: inv.cgst_rate,
    cgst_amount: inv.cgst_amount,

    total: inv.total,
    extracted_at: inv.extracted_at,
  };
}

async function main() {
  const flattened = invoices.map(flattenInvoice);

  const csv = stringify(flattened, {
    header: true,
  });

  await writeFile("invoices.csv", csv);

  console.log("✅ CSV generated successfully");
}

main();
