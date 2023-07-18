export class Pipeline {
  steps: any[];
  verbose: boolean;
  constructor(steps: any[], verbose = false) {
    this.steps = steps;
    this.verbose = verbose;
  }

  fit(x: number[][], y: number[]) {
    for (const step of this.steps) {
      step.fit(x, y);
    }
  }
}
