export class ActivationFunctions {
  static sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  static dsigmoid(x: number): number {
    return (
      ActivationFunctions.sigmoid(x) * (1 - ActivationFunctions.sigmoid(x))
    );
  }

  static relu(x: number): number {
    return x < 0 ? 0 : x;
  }

  static drelu(x: number): number {
    return x > 0 ? 1 : 0;
  }

  static cappedRelu(x: number): number {
    return x < 0 ? 0 : x > 1 ? 1 : x;
  }

  static dcappedRelu(x: number): number {
    return x <= 0 ? 0 : x > 1 ? 0 : 1;
  }

  static tanh(x: number): number {
    return (Math.exp(2 * x) - 1) / (Math.exp(2 * x) + 1);
  }

  static dtanh(x: number): number {
    return 1 - Math.tanh(x) * Math.tanh(x);
  }

  static softmax(logits: number[]): number[] {
    const maxLogit = Math.max(...logits); // Get the maximum logit value
    const expLogits = logits.map((logit) => Math.exp(logit - maxLogit)); // Subtract the maximum logit value to avoid overflow
    const sumExpLogits = expLogits.reduce((sum, expLogit) => sum + expLogit, 0); // Calculate the sum of the exponentiated logits
    const softmaxValues = expLogits.map((expLogit) => expLogit / sumExpLogits); // Calculate the softmax values

    return softmaxValues;
  }
}
