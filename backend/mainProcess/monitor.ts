import { Effect } from "effect";
import { readdir } from "fs/promises";
import { join } from "path";
import { extractText } from "unpdf";

const folderPath = "../data";

const startTotal = performance.now();

const files = await readdir(folderPath);
const pdfFiles = files.filter(file => file.endsWith(".pdf"));

for (const pdf of pdfFiles) {
  const start = performance.now();

  const filePath = join(folderPath, pdf);
  const data = await Bun.file(filePath).arrayBuffer();
  const rawBytes = await extractText(data);

  const end = performance.now();
  Effect.log("Start to Loggiin")
  console.log(`📄 ${pdf}`);
  console.log(`⏱ Time: ${(end - start).toFixed(2)} ms`);
  console.log(`📦 Size: ${data.byteLength} bytes\n`);
}

const endTotal = performance.now();
console.log(`🚀 Total time: ${(endTotal - startTotal).toFixed(2)} ms , total pdf ${pdfFiles.length} , avarage time for 1 pdf ${Number((endTotal - startTotal).toFixed(2)) / pdfFiles.length}`);
