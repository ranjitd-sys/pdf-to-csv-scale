import Fastify from "fastify";
import multipart from "@fastify/multipart";
import { createWriteStream } from "node:fs";
import { mkdir } from "node:fs/promises";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import cors from "@fastify/cors";
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
await mkdir(UPLOAD_DIR, { recursive: true });

fastify.post("/upload", async (req, res) => {
  const options: Record<string, string> = {};
  let filePath = "";
  try {
    const parts = req.parts();
    for await (const part of parts) {
      if (part.type === "file") {
        console.log(part.filename);
        const safeFile = `${part.filename}`;
        filePath = path.join(UPLOAD_DIR, safeFile);
        await pipeline(part.file, createWriteStream(filePath));
      } else {
        options[part.fieldname] = part.value as string;
      }
    }
    return {
      status: "SUCCESS",
      message: "Archive received by XYZ Engine",
      processedParams: options,
    };
  } catch (e) {
    res.status(500).send({ status: "ERROR", message: "Pipeline failure" });
    console.log(e);
  }
});

try {
  await fastify.listen({ port: 8080 });
  console.log("⚡ XYZ Engine: Fastify/Multipart Online");
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
