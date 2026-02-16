import { Schema } from "effect";

export const CreditNoteSchema = Schema.Struct({
  order_number: Schema.optional(Schema.String),
  order_date: Schema.optional(Schema.String),
  credit_note_no: Schema.optional(Schema.String),
  credit_note_date: Schema.optional(Schema.String),
  invoice_no: Schema.optional(Schema.String),
  invoice_date: Schema.optional(Schema.String),

  seller_name: Schema.NullOr(Schema.String),
  seller_city: Schema.NullOr(Schema.String),
  seller_state: Schema.NullOr(Schema.String),
  seller_pincode: Schema.NullOr(Schema.String),
  seller_gstin: Schema.NullOr(Schema.String),

  Bill_name: Schema.NullOr(Schema.String),
  place_of_supply_code: Schema.NullOr(Schema.String),
  place_of_supply_state: Schema.NullOr(Schema.String),

  ship_name: Schema.NullOr(Schema.String),
  ship_address: Schema.String,
  ship_state: Schema.String,
  ship_pincode: Schema.String,

  quantity: Schema.NullOr(Schema.Number),
  name: Schema.NullOr(Schema.String),
  sku: Schema.NullOr(Schema.String),
  quantity_confirm: Schema.NullOr(Schema.Number),
  unit_price: Schema.NullOr(Schema.Number),
  discount: Schema.NullOr(Schema.Number),
  taxable_value: Schema.NullOr(Schema.Number),

  igst: Schema.NullOr(
    Schema.Struct({
      rate: Schema.Number,
      amount: Schema.Number,
    })
  ),
  sgst: Schema.NullOr(
    Schema.Struct({
      rate: Schema.Number,
      amount: Schema.Number,
    })
  ),
  cgst: Schema.NullOr(
    Schema.Struct({
      rate: Schema.Number,
      amount: Schema.Number,
    })
  ),
  other_charges: Schema.NullOr(
    Schema.Struct({
      line_no: Schema.Number,
      description: Schema.String,
      code: Schema.String,
      unit_price: Schema.Number,
      taxable_value: Schema.Number,
      tax_type: Schema.String,
      tax_rate: Schema.Number,
      tax_amount: Schema.Number,
      line_total: Schema.Number,
    })
  ),
  total_tax: Schema.NullOr(Schema.Number),
  grand_total: Schema.NullOr(Schema.Number),
});

export const InvoiceSchema = Schema.Struct({
  // ==========================================
  // 1. From InvoiceDates (Undefined allowed)
  // ==========================================
  order_date: Schema.optional(Schema.String),
  invoice_date: Schema.optional(Schema.String),

  // ==========================================
  // 2. From InvoiceData (Optional fields)
  // ==========================================
  order_number: Schema.optional(Schema.String),
  invoice_number: Schema.optional(Schema.String),
  bill_to_name: Schema.optional(Schema.String),
  bill_to_address: Schema.optional(Schema.String),
  bill_to_state: Schema.optional(Schema.String),
  bill_to_pincode: Schema.optional(Schema.String),
  place_of_supply_code: Schema.optional(Schema.String),
  place_of_supply_state: Schema.optional(Schema.String),

  // ==========================================
  // 3. From Seller (Object is mandatory, fields specific)
  // ==========================================
  seller_name: Schema.String,
  // Note: These keys match your 'Seller' type exactly
  address: Schema.String, 
  city: Schema.String,
  state: Schema.String,
  pincode: Schema.String,
  gstin: Schema.NullOr(Schema.String),

  // ==========================================
  // 4. From Ship (Object is Nullable)
  // ==========================================
  // Since 'Ship' can be null, all its fields are marked NullOr
  ship_name: Schema.NullOr(Schema.String),
  ship_address: Schema.NullOr(Schema.String),
  ship_city: Schema.NullOr(Schema.String),
  ship_state: Schema.NullOr(Schema.String),
  ship_pincode: Schema.NullOr(Schema.String),

  // ==========================================
  // 5. From Product (Object is Nullable)
  // ==========================================
  // Defined as Strings to match your 'Product' type definition
  product_sn: Schema.NullOr(Schema.String),
  product_name: Schema.NullOr(Schema.String),
  product_hsn: Schema.NullOr(Schema.String),
  product_qty: Schema.NullOr(Schema.String),
  product_gross: Schema.NullOr(Schema.String),
  product_discount: Schema.NullOr(Schema.String),
  product_taxable_value: Schema.NullOr(Schema.String),

  // ==========================================
  // 6. Tax Structure (Preserved from CreditNote)
  // ==========================================
  igst: Schema.NullOr(
    Schema.Struct({
      rate: Schema.Number,
      amount: Schema.Number,
    })
  ),
  sgst: Schema.NullOr(
    Schema.Struct({
      rate: Schema.Number,
      amount: Schema.Number,
    })
  ),
  cgst: Schema.NullOr(
    Schema.Struct({
      rate: Schema.Number,
      amount: Schema.Number,
    })
  ),
  other_charges: Schema.NullOr(
    Schema.Struct({
      line_no: Schema.Number,
      description: Schema.String,
      code: Schema.String,
      unit_price: Schema.Number,
      taxable_value: Schema.Number,
      tax_type: Schema.String,
      tax_rate: Schema.Number,
      tax_amount: Schema.Number,
      line_total: Schema.Number,
    })
  ),
  total_tax: Schema.NullOr(Schema.Number),
  grand_total: Schema.NullOr(Schema.Number),
});

//next part to follew
export const TaxValidation = Schema.Struct({

})

export const InvoiceArraySchema = Schema.Array(InvoiceSchema);


export type Invoice = Schema.Schema.Type<typeof InvoiceSchema>;
export type InvoiceList = Schema.Schema.Type<typeof InvoiceArraySchema>;


export const CreditNotesArraySchema = Schema.Array(CreditNoteSchema);

export type CreditNote = Schema.Schema.Type<typeof CreditNoteSchema>;
export type CreditNotesArray = Schema.Schema.Type<typeof CreditNotesArraySchema>;