import { Schema } from "effect"
import { Effect } from "effect"
// Step 1: Base schema
const UserId = Schema.String.pipe(
  Schema.brand("UserId")
)

// Step 2: Infer Type
type UserId = Schema.Schema.Type<typeof UserId>
const parsed = Schema.decode(UserId)("user_123")

const data = await Effect.runPromise(parsed);
console.log(data)