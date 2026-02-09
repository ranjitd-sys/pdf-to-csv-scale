import { allLevels } from "effect/LogLevel";
import { readdir } from "fs/promises";
import { join } from "path";
import { extractText } from "unpdf";

const start = performance.now();
async function getFiles(){
    let allPdfContent:any = [];
    const folderPath = "../data"
    const startTotal = performance.now();
    const files = await readdir(folderPath);
    const pdfFiles = files.filter(file => file.endsWith(".pdf"));

    for (const pdf of pdfFiles) {
      const filePath = join(folderPath, pdf);
      const data = await Bun.file(filePath).arrayBuffer();
      const rawBytes = await extractText(data);
      rawBytes.text.map(data => allPdfContent.push(data));
      
    }
    return allPdfContent;
}
const res = await getFiles();

