import { Method } from "./Methods.ts";
import { Column } from "./Column.ts";

export class Pipeline {
  steps: Method[];
  verbose: boolean;
  constructor(steps: Method[], verbose = false) {
    this.steps = steps;
    this.verbose = verbose;
  }

  fit(x: Column, y: Column) {
    for (const step of this.steps) {
      step.fit(x, y);
    }
  }
}
