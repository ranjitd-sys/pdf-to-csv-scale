import { Schema } from "effect";
import { extend } from "effect/Scope";

export const OrderId = Schema.String.pipe(
  Schema.pattern(/^\d{18}$/),
  Schema.brand("OrderId"),
);

export const CreditNoteId = Schema.String.pipe(
    Schema.pattern(/^[A-Za-z0-9]{10,11}$/),
  Schema.brand("CreditNoteId")
);

export const GstNumber = Schema.String.pipe(
  Schema.pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/),
  Schema.brand("GstNumber")
);


export class NoPdfError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoPdfError";
  }
}


export type GstNumber = typeof GstNumber.Type;
export type CreditNote_id = typeof CreditNoteId.Type;
export type Order_id = typeof OrderId.Type;

