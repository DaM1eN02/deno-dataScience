export class DataFrame {
  private header: string[];
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

      this.dataFrame.push({
        name: this.header[i],
        data: column,
      });
    }
  }

  public getCol(name: string) {
    return (
      this.dataFrame.find((column) => {
        if (column.name === name) return column;
      }) ?? []
    );
  }

  public head(count: number) {
    console.table(this.data.slice(0, count));
    return this.data.slice(0, count);
  }
}

type Column = {
  name: string;
  data: string[];
};
