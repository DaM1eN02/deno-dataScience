import { DataFrame } from "./DataFrame.ts";

export function readCSV(file: string, seperator = ";", header?: string[]) {
  if (!file.endsWith(".csv"))
    throw new Error("Imported File is not a CSV file");

  const path = Deno.mainModule.split("/").slice(0, -1).join("/") + "/";
  const text = Deno.readTextFileSync(new URL(file, path));

  const lines = text.split("\n").map((line) => {
    line.replaceAll("\r", "");
    return line.split(seperator);
  });

  if (!header) {
    header = lines[0];
    lines.shift();
  }

  return new DataFrame(header, lines);
}
