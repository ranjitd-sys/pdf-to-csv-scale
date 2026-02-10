import Fastify from 'fastify';
import multipart from '@fastify/multipart';
import { createWriteStream } from 'node:fs';
import { mkdir } from 'node:fs/promises';
import { pipeline } from 'node:stream/promises';
import path from 'node:path';

const fastify = Fastify({
    logger:true
});

fastify.register(multipart, {
    limits:{
        fileSize: 100 * 1024 * 1024
    }
});
const UPLOAD_DIR = './uploads';
await mkdir(UPLOAD_DIR, { recursive: true });

fastify.post('/upload', async(req, res)=>{
    const options : Record<string,string>  = {};
    let filePath = '';
    const parts = req.parts();
    for await (const part of parts){
        if(part.type === "file"){
            console.log(part);
            const safeFile = `pdfyz_${Date.now()}_${part.filename}`
            const filePath = path.join();
            await pipeline(part.file, createWriteStream(filePath))
        }
        else{
            options[part.fieldname] = part.value as string;
        }
    }
});

try {
  await fastify.listen({ port: 8080 });
  console.log("⚡ XYZ Engine: Fastify/Multipart Online");
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}