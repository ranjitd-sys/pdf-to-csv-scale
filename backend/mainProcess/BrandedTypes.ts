import { Schema } from "effect";

export const OrderId = Schema.String.pipe(
  Schema.pattern(/^\d{18}$/),
  Schema.brand("OrderId"),
);

export const CreditNoteId = Schema.String.pipe(
  Schema.pattern(/^[A-Za-z0-9]{10}$/),
  Schema.brand("CreditNoteId")
);
export type CreditNoteId = typeof CreditNoteId.Type;
export type Order_id = typeof OrderId.Type;