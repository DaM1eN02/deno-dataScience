/**
 * Column class
 */
export class Column {
  public name: string;
  public data: string[];

  constructor(name: string, data: string[]) {
    this.name = name;
    this.data = data;
  }

  /**
   * Applies the given function to every single item
   * @param func Function to be applied
   */
  apply(func: CallableFunction): void {
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] = func(this.data[i]);
    }
  }

  /**
   * Returns the amount of items given from the top
   * @param count: number | Number of items to return
   * @returns: string[]
   */
  head(count: number) {
    return this.data.slice(0, count);
  }
}
