import type { CreditNote_id, CreditNoteId, Order_id } from "./BrandedTypes";
import { Schema } from "effect";
export type CreditNoteMeta = {
  order_number?: Order_id;
  order_date?: string;
  credit_note_no?: CreditNote_id;
  credit_note_date?: string;
  invoice_no?: string;
  invoice_date?: string;
};

export type Seller = {
  seller_name: string;
  seller_city: string;
  seller_state: string;
  seller_pincode: string;
  seller_gstin: string;
} | null;

export type BillTo = {
  Bill_name: string | null;
  place_of_supply_code: string | null;
  place_of_supply_state: string | null;
};

export type Ship = {
  ship_name: string | null
  ship_address: string;
  ship_state: string;
  ship_pincode: string;
};

export type ParsedProduct = {
  quantity: number;
  name: string;
  sku: string;
  quantity_confirm: number;
  unit_price: number;
  discount: number;
  taxable_value: number;
} | null;

export type TaxDetail = {
  rate: number;
  amount: number;
};

export type OtherCharge = {
  line_no: number;
  description: string;
  code: string;
  unit_price: number;
  taxable_value: number;
  tax_type: string;
  tax_rate: number;
  tax_amount: number;
  line_total: number;
};
export type OrderTaxInfo =  {
  igst: TaxDetail | null;
  sgst: TaxDetail | null;
  cgst: TaxDetail | null;
  other_charges: OtherCharge | null;
  total_tax: number | null;
  grand_total: number | null;
}


export const ParsedProductSchema = Schema.NullOr(
  Schema.Struct({
    quantity: Schema.Number,
    name: Schema.String,
    sku: Schema.String,
    quantity_confirm: Schema.Number,
    unit_price: Schema.Number,
    discount: Schema.Number,
    taxable_value: Schema.Number
  })
)

/* ---------------- TaxDetail ---------------- */

export const TaxDetailSchema = Schema.Struct({
  rate: Schema.Number,
  amount: Schema.Number
})

/* ---------------- OtherCharge ---------------- */

export const OtherChargeSchema = Schema.Struct({
  line_no: Schema.Number,
  description: Schema.String,
  code: Schema.String,
  unit_price: Schema.Number,
  taxable_value: Schema.Number,
  tax_type: Schema.String,
  tax_rate: Schema.Number,
  tax_amount: Schema.Number,
  line_total: Schema.Number
})

/* ---------------- OrderTaxInfo ---------------- */

export const OrderTaxInfoSchema = Schema.Struct({
  igst: Schema.optional(Schema.NullOr(TaxDetailSchema)),
  sgst: Schema.optional(Schema.NullOr(TaxDetailSchema)),
  cgst: Schema.optional(Schema.NullOr(TaxDetailSchema)),
  other_charges: Schema.NullOr(OtherChargeSchema),
  total_tax: Schema.NullOr(Schema.Number),
  grand_total: Schema.NullOr(Schema.Number)
})