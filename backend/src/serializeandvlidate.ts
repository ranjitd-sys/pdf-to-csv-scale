import { Effect, pipe, Chunk, Option } from "effect";
import { extractText } from "unpdf";

export const EffectExtractPdfData = Effect.gen(function* () {
  const file = Bun.file("../data/dyq4z26841.pdf");

  const buffer = yield* Effect.tryPromise({
    try: () => file.arrayBuffer(),
    catch: (e) => new Error("File Parsing Does not work"),
  });

  const text = yield* Effect.tryPromise({
    try: () => extractText(buffer),
    catch: (e) => new Error("File data cannot be added"),
  });

    const lines = pipe(
    text.text,
    Chunk.fromIterable,
    Chunk.map((line: any) => line.replace(/\u0000/g, "").replace(/\r/g, "")),
  );
  console.log(lines)
  return lines;
}).pipe(Effect.withSpan("get Data"));

export const PDF = await Effect.runPromise(EffectExtractPdfData);
// console.log(PDF)
