export const Process = Effect.gen(function* () {
  const folderPath = "./out"

  const files = yield* Effect.promise(() => readdir(folderPath))
  const pdfFiles = files.filter((file) => file.endsWith(".pdf"))

  // 1️⃣ Extract all text chunks first
  const allTextBlocks = yield* Effect.forEach(
    pdfFiles,
    (pdf) =>
      Effect.gen(function* () {
        const filePath = join(folderPath, pdf)
        const data = yield* Effect.promise(() =>
          Bun.file(filePath).arrayBuffer()
        )
        const rawBytes = yield* Effect.promise(() => extractText(data))
        return rawBytes.text
      }),
    { concurrency: 4 } // avoid blowing memory
  )

  const flatText = allTextBlocks.flat()

  // 2️⃣ Process each block in parallel (new fiber per block)
  const results = yield* Effect.forEach(
    flatText,
    (data) =>
      Effect.gen(function* () {
        if (data.includes("Credit Note")) {
          const orderMatch = data.match(
            /(Purchase\s+)?Order\s+Number\s*:\s*(\S+)/i
          )
          const orderNumber = orderMatch?.[2] ?? "Unknown"

          const res = yield* separateCreditNote(data)

          const result = {
            ...parseCreditNoteMeta(res.credit_note || ""),
            ...extractSoldBy(res.sold_by || ""),
            ...extractBillTo(res.bill_to || ""),
            ...extractShipTo(res.ship_to || ""),
            ...ExtractProduct(res.product || ""),
            ...parseTaxSection(res.taxes || ""),
          }

          return { type: "credit", data: result }
        } else {
          const clean = data.replace(/\r/g, "").trim()
          const orderMatch = clean.match(/\s*\n\s*(\d{12,})/)
          const orderNumber = orderMatch ? orderMatch[0] : "Unknown"

          const res = yield* separateTaxInvoice(data)

          const result = {
            ...extractInvoice(res.Bill_detail || ""),
            ...invoiceExtractShip(res.ship_to || ""),
            ...InvoiceextractProduct(res.product || ""),
            ...extractSellerDetails(res.sold_by || ""),
            ...parseTaxSection(res.taxes || ""),
            ...extractInvoiceDates(res.order || ""),
          }

          return { type: "invoice", data: result }
        }
      }).pipe(
        Effect.withSpan("Document Processing")
      ),
    {
      concurrency: 8, // 🔥 each block runs in its own fiber
    }
  )

  // 3️⃣ Separate results
  const CrediNotes = results
    .filter((r) => r.type === "credit")
    .map((r) => r.data)

  const TaxInvoice = results
    .filter((r) => r.type === "invoice")
    .map((r) => r.data)

  const CreditNoteCount = CrediNotes.length
  const TaxInvoiceCount = TaxInvoice.length

  // 4️⃣ Validate once
  const CreditValidate = yield* Schema.decodeUnknown(
    CreditNotesArraySchema
  )(CrediNotes).pipe(
    Effect.mapError(() => new Error("Invalid Credit Note Data"))
  )

  const TaxInvoiceValidate = yield* Schema.decodeUnknown(
    InvoiceArraySchema
  )(TaxInvoice).pipe(
    Effect.mapError(() => new Error("Invalid Tax Invoice Data"))
  )

  yield* Effect.annotateCurrentSpan({
    "credit_note.count": CreditNoteCount,
    "tax_invoice.count": TaxInvoiceCount,
  })

  return {
    CrediNotes,
    TaxInvoice,
    TaxInvoiceCount,
    CreditNoteCount,
    CreditValidate,
    TaxInvoiceValidate,
  }
}).pipe(
  Effect.withSpan("PDF_Processing_Pipeline", {
    attributes: { "peer.service": "DocumentProcessor" },
  })
)
