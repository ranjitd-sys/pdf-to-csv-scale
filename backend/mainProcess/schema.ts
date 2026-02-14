import { Schema } from "effect";

// Keep your individual struct definition
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

// Create the Array Schema
export const CreditNotesArraySchema = Schema.Array(CreditNoteSchema);

// Update your TypeScript types
export type CreditNote = Schema.Schema.Type<typeof CreditNoteSchema>;
export type CreditNotesArray = Schema.Schema.Type<typeof CreditNotesArraySchema>;