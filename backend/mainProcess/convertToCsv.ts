import { stringify } from "csv-stringify/sync";
import { Effect } from "effect";
import { rm } from "fs/promises";
import { Process } from "./process";
export async function convertToCSV(data: any[]) {
  const outputDir = "../output";
  const filePath = `${outputDir}/output.csv`;
  if (!data.length) {
    throw new Error("Array is empty");
  }

  const cleaned = data.map((item) => ({
    ...item,
    description: item.description?.replace(/\n/g, " ").trim(),
  }));

  const csv = stringify(cleaned, {
    header: true,
    columns: Object.keys(cleaned[0]), // keeps consistent order
  });

  await Bun.write(filePath, csv);

  console.log("CSV created ✅");
}

export const getCSV = async () => {
  const data = await Effect.runPromise(Process);
  await convertToCSV(data);

  await rm("./out", { recursive: true, force: true });
};
