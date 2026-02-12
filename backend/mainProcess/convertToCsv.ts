import { stringify } from "csv-stringify/sync"
import { Effect } from "effect"
import { writeFileSync } from "fs"
import { Process } from "./main"

function generateCSV(data: any[]) {
  const flattened = data.map((item) => ({
    order_number: item.order_number,
    order_date: item.order_date,
    credit_note_no: item.credit_note_no,
    credit_note_date: item.credit_note_date,
    invoice_no: item.invoice_no,
    invoice_date: item.invoice_date,

    seller_name: item.seller_name,
    seller_city: item.seller_city,
    seller_state: item.seller_state,
    seller_pincode: item.seller_pincode,
    seller_gstin: item.seller_gstin,

    bill_name: item.Bill_name,

    ship_name: item.ship_name,
    ship_state: item.ship_state,
    ship_pincode: item.ship_pincode,
    ship_address: item.ship_address,

    quantity: item.quantity,
    product_name: item.name,
    sku: item.sku,
    unit_price: item.unit_price,
    discount: item.discount,
    taxable_value: item.taxable_value,

    igst_rate: item.igst?.rate ?? "",
    igst_amount: item.igst?.amount ?? "",

    sgst_rate: item.sgst?.rate ?? "",
    sgst_amount: item.sgst?.amount ?? "",

    cgst_rate: item.cgst?.rate ?? "",
    cgst_amount: item.cgst?.amount ?? "",

    other_charge_unit_price: item.other_charges?.unit_price ?? "",
    other_charge_taxable_value: item.other_charges?.taxable_value ?? "",
    other_charge_tax_type: item.other_charges?.tax_type ?? "",
    other_charge_tax_rate: item.other_charges?.tax_rate ?? "",
    other_charge_tax_amount: item.other_charges?.tax_amount ?? "",

    total_tax: item.total_tax,
    grand_total: item.grand_total,
  }))
  console.log(flattened[20])
  const csv = stringify(flattened, {
    header: true,
  })

  writeFileSync("../output/output.csv", csv)
}
const innvoices = await Effect.runPromise(Process);

generateCSV(innvoices)