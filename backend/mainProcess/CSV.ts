import ExcelJS from "exceljs"
import { Effect } from "effect"
import { Process } from "./main"
import { NodeSdk } from "@effect/opentelemetry"
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base"
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http"
const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "Invoice" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter())
}))
export const CSV = Effect.gen(function * () {


  const data = yield* Process;

  const workbook = new ExcelJS.Workbook()

  // =====================================================
  // 1️⃣ SHEET 1 → CREDIT NOTES (FIRST PAGE)
  // =====================================================
  const creditSheet = workbook.addWorksheet("Credit Notes")

  creditSheet.columns = [
    { header: "Order Number", key: "order_number", width: 20 },
    { header: "Order Date", key: "order_date", width: 20 },
    { header: "Credit Note No", key: "credit_note_no", width: 20 },
    { header: "Credit Note Date", key: "credit_note_date", width: 20 },
    { header: "Invoice No", key: "invoice_no", width: 20 },
    { header: "Invoice Date", key: "invoice_date", width: 20 },

    { header: "Seller Name", key: "seller_name", width: 25 },
    { header: "Seller GSTIN", key: "seller_gstin", width: 20 },

    { header: "Bill Name", key: "bill_name", width: 25 },
    { header: "Ship Name", key: "ship_name", width: 25 },
    { header: "Ship State", key: "ship_state", width: 15 },
    { header: "Ship Pincode", key: "ship_pincode", width: 15 },

    { header: "Product Name", key: "product_name", width: 30 },
    { header: "SKU", key: "sku", width: 20 },
    { header: "Quantity", key: "quantity", width: 10 },
    { header: "Unit Price", key: "unit_price", width: 15 },
    { header: "Discount", key: "discount", width: 15 },
    { header: "Taxable Value", key: "taxable_value", width: 20 },

    { header: "IGST Rate", key: "igst_rate", width: 12 },
    { header: "IGST Amount", key: "igst_amount", width: 15 },
    { header: "SGST Rate", key: "sgst_rate", width: 12 },
    { header: "SGST Amount", key: "sgst_amount", width: 15 },
    { header: "CGST Rate", key: "cgst_rate", width: 12 },
    { header: "CGST Amount", key: "cgst_amount", width: 15 },

    { header: "Total Tax", key: "total_tax", width: 15 },
    { header: "Grand Total", key: "grand_total", width: 15 },
  ]

  data.CrediNotes.forEach((item: any) => {
    creditSheet.addRow({
      order_number: item.order_number,
      order_date: item.order_date,
      credit_note_no: item.credit_note_no,
      credit_note_date: item.credit_note_date,
      invoice_no: item.invoice_no,
      invoice_date: item.invoice_date,

      seller_name: item.seller_name,
      seller_gstin: item.seller_gstin,

      bill_name: item.Bill_name,
      ship_name: item.ship_name,
      ship_state: item.ship_state,
      ship_pincode: item.ship_pincode,

      product_name: item.name,
      sku: item.sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      discount: item.discount,
      taxable_value: item.taxable_value,

      igst_rate: item.igst?.rate ?? "",
      igst_amount: item.igst?.amount ?? "",
      sgst_rate: item.sgst?.rate ?? "",
      sgst_amount: item.sgst?.amount ?? "",
      cgst_rate: item.cgst?.rate ?? "",
      cgst_amount: item.cgst?.amount ?? "",

      total_tax: item.total_tax,
      grand_total: item.grand_total,
    })
  })

  // Style Header
  creditSheet.getRow(1).font = { bold: true }

  // Freeze header
  creditSheet.views = [{ state: "frozen", ySplit: 1 }]

  // =====================================================
  // 2️⃣ SHEET 2 → TAX INVOICES (SECOND PAGE)
  // =====================================================
  const taxSheet = workbook.addWorksheet("Tax Invoices")

  taxSheet.columns = [
    { header: "Order Number", key: "order_number", width: 20 },
    { header: "Invoice Number", key: "invoice_number", width: 20 },
    { header: "Order Date", key: "order_date", width: 20 },
    { header: "Invoice Date", key: "invoice_date", width: 20 },

    { header: "Bill To Name", key: "bill_to_name", width: 25 },
    { header: "Bill To State", key: "bill_to_state", width: 15 },
    { header: "Bill To Pincode", key: "bill_to_pincode", width: 15 },

    { header: "Ship Name", key: "ship_name", width: 25 },
    { header: "Ship State", key: "ship_state", width: 15 },
    { header: "Ship Pincode", key: "ship_pincode", width: 15 },

    { header: "Product Name", key: "product_name", width: 30 },
    { header: "HSN", key: "product_hsn", width: 15 },
    { header: "Qty", key: "product_qty", width: 10 },
    { header: "Gross", key: "product_gross", width: 15 },
    { header: "Discount", key: "product_discount", width: 15 },
    { header: "Taxable Value", key: "product_taxable_value", width: 20 },

    { header: "IGST Rate", key: "igst_rate", width: 12 },
    { header: "IGST Amount", key: "igst_amount", width: 15 },

    { header: "Total Tax", key: "total_tax", width: 15 },
    { header: "Grand Total", key: "grand_total", width: 15 },
  ]

  data.TaxInvoice.forEach((invoice: any) => {
    taxSheet.addRow({
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

      total_tax: invoice.total_tax,
      grand_total: invoice.grand_total,
    })
  })

  taxSheet.getRow(1).font = { bold: true }
  taxSheet.views = [{ state: "frozen", ySplit: 1 }]

  // =====================================================
  // SAVE FILE
  // =====================================================
  yield * Effect.promise(()=>  workbook.xlsx.writeFile("../output/output.xlsx")) 
  
  console.log("Excel file generated successfully ✅")
}).pipe(Effect.withSpan("CSV Generator"))




Effect.runPromise(
  CSV.pipe(
    //@ts-ignore
    Effect.provide(NodeSdkLive),
    Effect.catchAllCause(Effect.logError)
  )
)