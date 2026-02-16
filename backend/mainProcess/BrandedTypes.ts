import { Effect, Order, Schema } from "effect"


export const ValidateOrderID = Schema.String.pipe(
   Schema.pattern(/^\d{18}$/),
  Schema.brand("OrderIdBrand")
)


export type Order_id = typeof ValidateOrderID.Type;


