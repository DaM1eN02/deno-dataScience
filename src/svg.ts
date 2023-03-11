import { DataFrame } from "./DataFrame.ts";

export function readSVG(file: string, seperator = ";", header?: string[]) {
  if (!file.endsWith(".csv"))
    throw new Error("Imported File is not a CSV file");

  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(Deno.readFileSync(file));

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
