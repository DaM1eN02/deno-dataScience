import { Column } from "./Column.ts";

export class DataFrame {
  public header: string[];
  private data: string[][];
  private dataFrame: Column[] = [];

  constructor(header: string[], data: string[][]) {
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

  public getCol(name: string) {
    const col: Column =
      this.dataFrame.find((column) => {
        if (column.name === name) return column;
      }) ?? new Column("COLUMN NOT FOUND", []);

    return col;
  }

  public setCol(name: string, data: []) {
    const index = this.dataFrame.findIndex((col) => {
      if (col.name == name) return true;
    });

    if (index != -1) {
      this.dataFrame[index].data = data;
    } else {
      console.log("There is no column with the name " + name);
    }
  }

  public head(count: number) {
    console.table(this.data.slice(0, count));
    return this.data.slice(0, count);
  }
}
