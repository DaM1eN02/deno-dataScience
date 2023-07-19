import { Column } from "./Column.ts";

/**
 * DataFrame class
 */
export class DataFrame {
  public header: string[];
  private data: string[][];
  private dataFrame: Column[] = [];

  private constructor(header: string[], data: string[][]) {
    this.header = header;
    this.data = data;

    for (let i = 0; i < this.header.length || i < data.length; i++) {
      const column: string[] = [];
      for (const line of data) {
        column.push(line[i]);
      }

      this.dataFrame.push(new Column(this.header[i], column));
    }
  }

  /**
   * Reads a csv file and returns a DataFrame object
   * @param file: string | File name of the csv file to read from
   * @param seperator: string | Char, which seperates the csv data | default: ";"
   * @param header: string[] | Array of column names for the data frame | default: First row of the csv file
   * @returns DataFrame
   */
  public readCSV(file: string, seperator = ";", header?: string[]): DataFrame {
    const path = `${Deno.mainModule.split("/").slice(0, -1).join("/")}/`;
    const text = Deno.readTextFileSync(new URL(`${file}.csv`, path));

    const lines = text.split("\n").map((line) => {
      line = line.replaceAll("\r", "");
      return line.split(seperator);
    });

    if (!header) {
      header = lines[0];
      lines.shift();
    }

    return new DataFrame(header, lines);
  }

  /**
   *
   * @param file
   * @param seperator
   */
  public writeCSV(file: string, seperator = ";") {
    let csv = "";

    this.data.forEach((row) => {
      row.forEach((col) => {
        csv += col += seperator;
      });
      csv += `\n`;
    });

    const path = `${Deno.mainModule
      .split("/")
      .slice(3, -1)
      .join("/")}/${file}.csv`;
    const encoder = new TextEncoder();
    Deno.writeFileSync(path, encoder.encode(csv));
  }

  /**
   * Returns the Column as an Column object
   * @param name: string | Name of the Column
   * @returns Column
   */
  public getCol(name: string): Column {
    const col: Column =
      this.dataFrame.find((column) => {
        if (column.name === name) return column;
      }) ?? new Column("COLUMN NOT FOUND", []);

    return col;
  }

  /**
   * Replaces a Column in the DataFrame with the data given
   * @param name: string | Name of the Column
   * @param data: any[] | Data to replace in the DataFrame
   */
  public setCol(name: string, data: string[]): void {
    const index = this.dataFrame.findIndex((col) => {
      if (col.name == name) return true;
    });

    if (index != -1) {
      this.dataFrame[index].data = data;
    } else {
      console.log("There is no column with the name " + name);
    }
  }

  /**
   * Returns a row from the DataFrame
   * @param number Row number
   * @returns string[] of the row
   */
  public getRow(number: number): string[] {
    return this.data[number];
  }

  public setRow(number: number, data: string[]) {
    this.data[number] = data;

    data.forEach((item, id) => {
      const newCol = this.getCol(this.header[id]).data;
      newCol[0] = item;
      this.setCol(this.header[id], newCol);
    });
  }

  public insert(data: string[]) {
    this.data.push(data);

    data.forEach((item, id) => {
      const newCol = this.getCol(this.header[id]).data;
      newCol.push(item);
      this.setCol(this.header[id], newCol);
    });
  }

  /**
   * Returns the amount of rows given from the top
   * @param count: number | Number of rows to return
   * @returns: string[][]
   */
  public head(count: number): string[][] {
    return this.data.slice(0, count);
  }
}

/**
 *
 * @param file
 * @param seperator
 * @returns string[][]
 */
export function readCSVLight(file: string, seperator = ";"): string[][] {
  const path = Deno.mainModule.split("/").slice(0, -1).join("/") + "/";
  const text = Deno.readTextFileSync(new URL(`${file}.csv`, path));

  return text.split("\n").map((line) => {
    line = line.replaceAll("\r", "");
    return line.split(seperator);
  });
}
