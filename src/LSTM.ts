import { ActivationFunctions } from "./ActivationFunctions.ts";

export class LSTM {
  public STM: number;
  public LTM: number;

  private wi0: number;
  private wi1: number;
  private wi2: number;
  private wi3: number;
  private wstm0: number;
  private wstm1: number;
  private wstm2: number;
  private wstm3: number;

  private bstm0: number;
  private bstm1: number;
  private bstm2: number;
  private bstm3: number;

  constructor() {
    this.STM = 0;
    this.LTM = 0;

    this.wi0 = Math.random() * 5;
    this.wi1 = Math.random() * 5;
    this.wi2 = Math.random() * 5;
    this.wi3 = Math.random() * 5;
    this.wstm0 = Math.random() * 5;
    this.wstm1 = Math.random() * 5;
    this.wstm2 = Math.random() * 5;
    this.wstm3 = Math.random() * 5;
    this.bstm0 = Math.random() * 5;
    this.bstm1 = Math.random() * 5;
    this.bstm2 = Math.random() * 5;
    this.bstm3 = Math.random() * 5;
  }

  train(x: number, y: number) {}

  predict(x: number) {
    return (
      ActivationFunctions.tanh(
        this.LTM *
          ActivationFunctions.sigmoid(
            x * this.wi0 + this.STM * this.wstm0 + this.bstm0
          ) +
          ActivationFunctions.sigmoid(
            x * this.wi1 + this.STM * this.wstm1 + this.bstm1
          ) *
            ActivationFunctions.tanh(
              x * this.wi2 + this.STM * this.wstm2 + this.bstm2
            )
      ) *
      ActivationFunctions.sigmoid(
        x * this.wi3 + this.STM * this.wstm3 + this.bstm3
      )
    );
  }

  calc(x: number) {
    const NLTM =
      this.LTM *
        ActivationFunctions.sigmoid(
          x * this.wi0 + this.STM * this.wstm0 + this.bstm0
        ) +
      ActivationFunctions.sigmoid(
        x * this.wi1 + this.STM * this.wstm1 + this.bstm1
      ) *
        ActivationFunctions.tanh(
          x * this.wi2 + this.STM * this.wstm2 + this.bstm2
        );
    return {
      LTM: NLTM,
      STM:
        ActivationFunctions.tanh(NLTM) *
        ActivationFunctions.sigmoid(
          x * this.wi3 + this.STM * this.wstm3 + this.bstm3
        ),
    };
  }
}
