import { Schema } from "@effect/schema";

export const CreditNoteSchema = Schema.Struct({
  // --- Identifiers & Dates ---
  order_number: Schema.String,
  order_date: Schema.Union(Schema.Date, Schema.String), // Accepts Date obj or ISO string
  credit_note_no: Schema.optional(Schema.String), // Optional in case it doesn't exist
  credit_note_date: Schema.optional(Schema.Union(Schema.Date, Schema.String)),
  invoice_no: Schema.String,
  invoice_date: Schema.Union(Schema.Date, Schema.String),

  // --- Seller Details ---
  seller_name: Schema.String,
  seller_city: Schema.String,
  seller_state: Schema.String,
  seller_pincode: Schema.Union(Schema.String, Schema.Number), // Pincodes can be strict strings or numbers
  seller_gstin: Schema.String,

  // --- Billing & Shipping ---
  bill_name: Schema.String,
  ship_name: Schema.String,
  ship_state: Schema.String,
  ship_pincode: Schema.Union(Schema.String, Schema.Number),
  ship_address: Schema.String,

  // --- Product Details ---
  quantity: Schema.Number,
  product_name: Schema.String,
  sku: Schema.String,
  unit_price: Schema.Number,
  discount: Schema.Number,
  taxable_value: Schema.Number,

  // --- Tax Breakdowns (IGST/SGST/CGST) ---
  // Using Union because your code uses `?? ""`
  igst_rate: Schema.Union(Schema.Number, Schema.Literal("")),
  igst_amount: Schema.Union(Schema.Number, Schema.Literal("")),

  sgst_rate: Schema.Union(Schema.Number, Schema.Literal("")),
  sgst_amount: Schema.Union(Schema.Number, Schema.Literal("")),

  cgst_rate: Schema.Union(Schema.Number, Schema.Literal("")),
  cgst_amount: Schema.Union(Schema.Number, Schema.Literal("")),

  // --- Other Charges ---
  other_charge_unit_price: Schema.Union(Schema.Number, Schema.Literal("")),
  other_charge_taxable_value: Schema.Union(Schema.Number, Schema.Literal("")),
  other_charge_tax_type: Schema.String, // Likely a string if it exists
  other_charge_tax_rate: Schema.Union(Schema.Number, Schema.Literal("")),
  other_charge_tax_amount: Schema.Union(Schema.Number, Schema.Literal("")),

  // --- Totals ---
  total_tax: Schema.Number,
  grand_total: Schema.Number,
});

// Extract the TypeScript Type
export type CreditNote  = Schema.Schema.Type<typeof CreditNoteSchema>;