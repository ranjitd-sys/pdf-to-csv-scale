import { Process } from "./main";
import { Effect } from "effect";
function TaxInvoicesgenerateCSV(invoices: any[]) {
  const flattened = invoices.map((invoice) => ({
    order_number: invoice.order_number,
    invoice_number: invoice.invoice_number,
    order_date: invoice.order_date,
    invoice_date: invoice.invoice_date,

    bill_to_name: invoice.bill_to_name,
    bill_to_state: invoice.bill_to_state,
    bill_to_pincode: invoice.bill_to_pincode,

    ship_name: invoice.ship_name,
    ship_state: invoice.ship_state,
    ship_pincode: invoice.ship_pincode,

    product_name: invoice.product_name,
    product_hsn: invoice.product_hsn,
    product_qty: invoice.product_qty,
    product_gross: invoice.product_gross,
    product_discount: invoice.product_discount,
    product_taxable_value: invoice.product_taxable_value,

    igst_rate: invoice.igst?.rate ?? "",
    igst_amount: invoice.igst?.amount ?? "",

    other_charges_description: invoice.other_charges?.description ?? "",
    other_charges_tax_amount: invoice.other_charges?.tax_amount ?? "",

    total_tax: invoice.total_tax,
    grand_total: invoice.grand_total,
    
  }));
  console.log(flattened)
}
async function main(){
    const invoices = await Effect.runPromise(Process);
    TaxInvoicesgenerateCSV(invoices.TaxInvoice);
}
main()
