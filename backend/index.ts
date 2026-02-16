import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import cors from "@fastify/cors";
import { $ } from "bun";
import { Effect } from "effect";
import fs from "fs";
import { NodeSdk } from "@effect/opentelemetry";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

import { CSV, Main } from "./mainProcess/CSV";

const NodeSdkLive = NodeSdk.layer(() => ({
  resource: { serviceName: "Invoice" },
  spanProcessor: new BatchSpanProcessor(new OTLPTraceExporter()),
}));

const fastify = Fastify({
  logger: true,
});

fastify.register(multipart, {
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
});
fastify.register(cors, {
  origin: true,
});
const UPLOAD_DIR = "./uploads";

fastify.post("/upload", async (req, res) => {
  const options: Record<string, string> = {};
  let filePath = "";
  await mkdir(UPLOAD_DIR, { recursive: true });
  try {
    const parts = req.parts();
    for await (const part of parts) {
      if (part.type === "file") {
        const safeFile = `${part.filename}`;
        filePath = path.join(UPLOAD_DIR, safeFile);
        await pipeline(part.file, createWriteStream(filePath));
        await $`unzip ./${UPLOAD_DIR}/${safeFile} -d out`;
        
        const Process =  await Effect.runPromise(CSV.pipe(Effect.provide(NodeSdkLive)));
        console.log("data",Process)
        return {
          status: "SUCCESS",
          message: "Data Parse Sussessfully",
          processedParams: options,
        };
      } else {
        options[part.fieldname] = part.value as string;
      }
    }
    return {
      status: "SUCCESS",
      message: "Sussfully Converted to CSV",
      processedParams: options,
    };
  } catch (e) {
    // res.status(500).send({ status: "ERROR", message: "Pipeline failure" });
    if(e instanceof Error){
      if(e.message === "Invalid Credit Note Data"){
        res.status(422).send({status:"Invalid Data", "Message":"Kindly Upload Valid Zip"})
      }
    }
  } finally {
    await $`rm -rf ./out`;
    await $`rm -rf ./uploads`;
  }
});

fastify.get("/download", async (req, reply) => {
  const filePath = path.join(__dirname, "../output/output.xlsx");
  reply.header("Content-Disposition", "attachment; filename=output.xlsx");
  reply.type("application/xlsx");
  return reply.send(fs.createReadStream(filePath));
});
try {
  await fastify.listen({ port: 8080 });
  console.log("⚡ XYZ Engine: Fastify/Multipart Online");
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
