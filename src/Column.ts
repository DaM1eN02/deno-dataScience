export class Column {
  public name: string;
  public data: string[];

  constructor(name: string, data: string[]) {
    this.name = name;
    this.data = data;
  }

  apply(func: CallableFunction) {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = func(this.data[i]);
    }
  }
}
