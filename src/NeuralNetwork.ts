import { ActivationFunctions } from "./ActivationFunctions.ts";

/**
 * Neural Network class
 */
export class NeuralNetwork {
  public network: number[][][];
  private connections: number[][][];
  private outputLabels: string[];
  private method: CallableFunction;
  private methodName: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH";
  private dmethod: CallableFunction;

  /**
   * Constructs a new NeuralNetwork object.
   * @param layerSizes An array containing the sizes of each layer of the neural network.
   * @param outputLabels An optional array of labels for the output nodes.
   * @param activation The activation function to use. One of "SIGMOID", "RELU", "CAPPED RELU", or "TANH". Defaults to "RELU".
   * @param learningRate The learning rate for training the neural network. Defaults to 0.01.
   */
  constructor(
    layerSizes: number[] = [2, 2],
    activation: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH" = "RELU",
    public learningRate: number = 0.01,
    outputLabels?: string[]
  ) {
    this.learningRate = learningRate;
    if (layerSizes.length < 2)
      throw new Error("Invalid layer sizes: must have at least two layers");

    this.outputLabels = outputLabels
      ? outputLabels
      : Array.from(
          { length: layerSizes[layerSizes.length - 1] },
          (_label, i) => `Output ${i}`
        );
    if (this.outputLabels.length != layerSizes[layerSizes.length - 1])
      throw new Error("Output Layer and Labels have diffrent lengths");

    if (learningRate <= 0) new Error("Learning Rate must be positive");

    this.network = [];
    for (let i = 0; i < layerSizes.length; i++) {
      this.network.push([]);
      for (let j = 0; j < layerSizes[i]; j++) {
        this.network[i].push([0, 0, 0]);
      }
    }

    this.connections = [];
    for (let i = 0; i < this.network.length - 1; i++) {
      this.connections.push([]);
      for (let j = 0; j < this.network[i].length; j++) {
        this.connections[i].push([]);
        for (let k = 0; k < this.network[i + 1].length; k++) {
          this.connections[i][j].push(Math.random() * 2 - 1);
        }
      }
    }

    switch (activation) {
      case "SIGMOID":
        this.method = ActivationFunctions.sigmoid;
        this.dmethod = ActivationFunctions.dsigmoid;
        break;
      case "RELU":
        this.method = ActivationFunctions.relu;
        this.dmethod = ActivationFunctions.drelu;
        break;
      case "CAPPED RELU":
        this.method = ActivationFunctions.cappedRelu;
        this.dmethod = ActivationFunctions.dcappedRelu;
        break;
      case "TANH":
        this.method = ActivationFunctions.tanh;
        this.dmethod = ActivationFunctions.dtanh;
        break;
      default:
        this.method = ActivationFunctions.sigmoid;
        this.dmethod = ActivationFunctions.dsigmoid;
        break;
    }

    this.methodName = activation;
  }

  /**
   * Trains the neural network with the provided input and output data.
   * @param x An array of input data.
   * @param y An array of expected output data.
   */
  train(x: number[], y: number[]) {
    this.feedForward(x);
    this.backpropagate(y);
  }

  /**
   * Trains the neural network with multiple input-output data pairs.
   * @param x An array of input data.
   * @param y An array of expected output data.
   */
  fit(x: number[][], y: number[][]) {
    [x, y] = this.randomShuffle(x, y);
    for (let i = 0; i < x.length; i++) {
      this.train(x[i], y[i]);
    }
  }

  private randomShuffle(X: number[][], Y: number[][]) {
    if (X.length !== Y.length)
      throw new Error("Input arrays must have the same length.");

    const shuffledX = [...X];
    const shuffledY = [...Y];

    for (let i = shuffledX.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      // Swap elements at index i and j
      [shuffledX[i], shuffledX[j]] = [shuffledX[j], shuffledX[i]];
      [shuffledY[i], shuffledY[j]] = [shuffledY[j], shuffledY[i]];
    }

    return [shuffledX, shuffledY];
  }

  /**
   * Predicts the output for the given input data using the trained neural network.
   * @param input An array of input data.
   * @returns The predicted output.
   */
  predict(input: number[]) {
    this.feedForward(input);

    let highestID = 0;
    let highestValue = this.network[this.network.length - 1][0][0];
    this.network[this.network.length - 1].forEach((node, i) => {
      if (node[0] > highestValue) {
        highestID = i;
        highestValue = node[0];
      }
    });

    return this.outputLabels[highestID];
  }

  private setInputValues(input: number[]) {
    for (let i = 0; i < input.length; i++) {
      this.network[0][i][0] = input[i];
    }
  }

  private feedForward(input: number[]) {
    this.setInputValues(input);

    for (let layerID = 0; layerID < this.network.length - 1; layerID++) {
      this.network[layerID + 1].forEach((node1, node1Index) => {
        node1[0] = 0;
        this.network[layerID].forEach((node0, node0Index) => {
          node1[0] +=
            node0[0] * this.connections[layerID][node0Index][node1Index];
        });
      });
      this.network[layerID + 1].forEach((node) => {
        node[0] = this.method(node[0] + node[1]);
      });
    }

    const outputValues = this.network[this.network.length - 1].map(
      (node) => node[0]
    );

    const softOutput = ActivationFunctions.softmax(outputValues);

    for (let i = 0; i < this.network[this.network.length - 1].length; i++) {
      this.network[this.network.length - 1][i][0] = softOutput[i];
    }
  }

  backpropagate(target: number[]) {
    this.network[this.network.length - 1].forEach((node, i) => {
      const error =
        ActivationFunctions.dsigmoid(node[0]) * (target[i] - node[0]); // Compute error using derivative of sigmoid
      this.network[this.network.length - 1][i][2] = error; // bias Error
      this.network[this.network.length - 1][i][1] += this.learningRate * error;
    });

    for (let i = this.network.length - 2; i >= 0; i--) {
      this.network[i] = this.network[i].map((node, nodeIndex) => {
        let totalError = 0;

        this.connections[i][nodeIndex] = this.connections[i][nodeIndex].map(
          (weight, weightIndex) => {
            const error = this.network[i + 1][weightIndex][2] * weight;
            totalError += error;
            return weight + this.learningRate * node[0] * error;
          }
        );

        return [node[0], node[1], this.dmethod(node[0]) * totalError];
      });

      // Compute bias updates
      this.network[i] = this.network[i].map((node) => {
        node[1] += this.learningRate * node[2];
        return [node[0], node[1], node[2]];
      });
    }
  }

  /**
   * Dumps the trained neural network to a JSON file.
   * @param name The name of the file to dump the neural network to.
   */
  dump(name: string): void {
    const layers: number[] = [];
    this.network.forEach((layer) => {
      layers.push(layer.length);
    });

    const nodes: number[][] = [];
    this.network.forEach((layer, layerID) => {
      nodes.push([]);
      layer.forEach((node) => {
        nodes[layerID].push(node[1]);
      });
    });

    const json: JSONNN = {
      method: this.methodName,
      learningRate: this.learningRate,
      layer: layers,
      outputLabels: this.outputLabels,
      nodes: nodes,
      connections: this.connections,
    };

    const encoder = new TextEncoder();
    const path =
      Deno.mainModule.split("/").slice(3, -1).join("/") + "/" + name + ".json";
    Deno.writeFileSync(path, encoder.encode(JSON.stringify(json)));
  }

  static load(name: string): NeuralNetwork {
    const decoder = new TextDecoder();
    const path =
      Deno.mainModule.split("/").slice(3, -1).join("/") + "/" + name + ".json";
    const json: JSONNN = JSON.parse(decoder.decode(Deno.readFileSync(path)));

    const nn = new NeuralNetwork(
      json.layer,
      json.method,
      json.learningRate,
      json.outputLabels
    );

    for (let i = 0; i < nn.network.length; i++) {
      nn.network[i] = json.nodes[i].map((bias) => [0, bias, 0]);
    }
    for (let i = 0; i < nn.network.length - 1; i++) {
      nn.connections = json.connections;
    }

    return nn;
  }
}

type JSONNN = {
  method: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH";
  learningRate: number;
  layer: number[];
  outputLabels: string[];
  nodes: number[][];
  connections: number[][][];
};
