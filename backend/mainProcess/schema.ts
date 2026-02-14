import { Schema } from "effect";

export const CreditNoteSchema = Schema.Struct({
  // --- From umber ---S
  order_number: Schema.optional(Schema.String),
  order_date: Schema.optional(Schema.String),
  credit_note_no: Schema.optional(Schema.String),
  credit_note_date: Schema.optional(Schema.String),
  invoice_no: Schema.optional(Schema.String),
  invoice_date: Schema.optional(Schema.String),

  // --- From Seller (Nullable) ---
  // Since the original 'Seller' object could be null, these fields are marked NullOr
  seller_name: Schema.NullOr(Schema.String),
  seller_city: Schema.NullOr(Schema.String),
  seller_state: Schema.NullOr(Schema.String),
  seller_pincode: Schema.NullOr(Schema.String),
  seller_gstin: Schema.NullOr(Schema.String),

  // --- From BillTo ---
  Bill_name: Schema.NullOr(Schema.String),
  place_of_supply_code: Schema.NullOr(Schema.String),
  place_of_supply_state: Schema.NullOr(Schema.String),

  // --- From Ship ---
  ship_name: Schema.NullOr(Schema.String),
  ship_address: Schema.String,
  ship_state: Schema.String,
  ship_pincode: Schema.String,

  // --- From ParsedProduct (Nullable) ---
  // These represent the main product line items
  quantity: Schema.NullOr(Schema.Number),
  name: Schema.NullOr(Schema.String),
  sku: Schema.NullOr(Schema.String),
  quantity_confirm: Schema.NullOr(Schema.Number),
  unit_price: Schema.NullOr(Schema.Number),
  discount: Schema.NullOr(Schema.Number),
  taxable_value: Schema.NullOr(Schema.Number),

  // --- From OrderTaxInfo ---
  // We flatten the container, but keep the complex tax objects to avoid naming collisions
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

// Export the Type
