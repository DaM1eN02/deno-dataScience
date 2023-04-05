export class NeuralNetwork {
  private layer: Layer[];
  private outputLabels: string[];
  private method: CallableFunction;
  private methodName: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH";
  private dmethod: CallableFunction;
  private learningRate: number;

  constructor(
    layerSizes: number[] = [1, 1],
    outputLabels?: string[],
    activation: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH" = "SIGMOID",
    learningRate: number = 0.01
  ) {
    if (layerSizes.length < 2)
      throw new Error("Invalid layer sizes: must have at least two layers");
    if (!outputLabels) {
      outputLabels = [];
      for (let i = 0; i < layerSizes[layerSizes.length - 1]; i++) {
        outputLabels.push(i.toString());
      }
    }
    if (outputLabels.length != layerSizes[layerSizes.length - 1])
      throw new Error("Output Layer and Labels have diffrent lengths");
    if (learningRate <= 0) throw new Error("Learning Rate must be positive");

    this.learningRate = learningRate;
    this.layer = [];
    for (let i = 0; i < layerSizes.length; i++) {
      this.layer.push(new Layer(layerSizes[i]));
    }

    for (let i = 0; i < this.layer.length - 1; i++) {
      this.layer[i].nodes.forEach((node) => {
        this.layer[i + 1].nodes.forEach((nextNode) => {
          let weight = undefined;
          switch (activation) {
            case "SIGMOID":
              weight = Math.random() * 2 - 1;
              break;
            case "TANH":
              weight = Math.random() * 2 - 1;
              break;
            case "CAPPED RELU":
              weight = Math.random() * 0.1;
              break;
            case "RELU":
              weight = Math.random() * 0.1;
              break;
            default:
              break;
          }
          const con = new Connection(node, nextNode, weight);
          node.rightConnections.push(con);
          nextNode.leftConnections.push(con);
        });
      });
    }

    this.outputLabels = outputLabels;
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

  train(x: number[], y: number[]) {
    this.feedForward(x);
    this.backpropagation(y);
  }

  fit(x: number[][], y: number[][]) {
    for (let i = 0; i < x.length; i++) {
      this.train(x[i], y[i]);
    }
  }

  predict(input: number[]) {
    this.feedForward(input);

    let highestID = 0;
    let highestValue = this.layer[this.layer.length - 1].nodes[0].value;
    this.layer[this.layer.length - 1].nodes.forEach((node, i) => {
      if (node.value > highestValue) {
        highestID = i;
        highestValue = node.value;
      }
    });

    return this.outputLabels[highestID];
  }

  private setInputValues(input: number[]) {
    for (let i = 0; i < input.length; i++) {
      this.layer[0].nodes[i].value = input[i];
    }
  }

  private feedForward(input: number[]) {
    this.setInputValues(input);
    for (let i = 1; i < this.layer.length; i++) {
      this.layer[i].nodes.forEach((node) => {
        node.leftConnections.forEach((connection) => {
          node.value += connection.leftNode.value * connection.weight;
        });
        node.value = this.method(node.value + node.bias);
      });
    }
  }

  private backpropagation(target: number[]) {
    this.layer[this.layer.length - 1].nodes.forEach((node, i) => {
      const error =
        ActivationFunctions.dsigmoid(node.value) * (target[i] - node.value); // Compute error using derivative of sigmoid
      node.biasError = error;
      node.outputError = error;
    });

    for (let i = this.layer.length - 2; i > 0; i--) {
      this.layer[i].nodes.forEach((node) => {
        let totalError = 0;
        node.rightConnections.forEach((con) => {
          totalError += con.rightNode.biasError * con.weight;
          const gradient = node.value * con.rightNode.biasError * con.weight;
          con.weight += this.learningRate * gradient;
        });

        const error = this.dmethod(node.value) * totalError;
        node.biasError = error;
        node.outputError = error;
      });

      // Compute bias updates
      this.layer[i].nodes.forEach((node) => {
        node.bias += this.learningRate * node.biasError;
      });
    }
  }

  dump(name: string): void {
    const layers: JSONLayer[] = [];
    this.layer.forEach((layer) => {
      const nodes = layer.nodes.map((node) => {
        return node.id;
      });

      layers.push({
        id: layer.id,
        size: layer.size,
        nodes: nodes,
      });
    });

    const nodes: JSONNode[] = [];
    this.layer.forEach((layer) => {
      layer.nodes.forEach((node) => {
        const leftConnections = node.leftConnections.map((con) => {
          return con.id;
        });
        const rightConnections = node.rightConnections.map((con) => {
          return con.id;
        });

        nodes.push({
          id: node.id,
          bias: node.bias,
          leftConnections: leftConnections,
          rightConnections: rightConnections,
        });
      });
    });

    const connections: JSONConnection[] = [];
    for (let i = 0; i < this.layer.length - 1; i++) {
      this.layer[i].nodes.forEach((node) => {
        node.rightConnections.forEach((con) => {
          connections.push({
            id: con.id,
            leftNodeId: con.leftNode.id,
            rightNodeId: con.rightNode.id,
            weight: con.weight,
          });
        });
      });
    }

    const json: JSONNN = {
      method: this.methodName,
      learningRate: this.learningRate,
      layer: layers,
      outputLabels: this.outputLabels,
      nodes: nodes,
      connections: connections,
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
      json.layer.map((layer) => layer.size),
      json.outputLabels,
      json.method
    );
    nn.learningRate = json.learningRate;
    nn.layer = [];
    json.layer.forEach((layer) => {
      const newLayer = new Layer(layer.size, layer.id);
      newLayer.nodes = [];
      layer.nodes.forEach((nodeId) => {
        const node = json.nodes.find((n) => n.id == nodeId);
        newLayer.nodes.push(new Node(node?.bias, node?.id));
      });

      nn.layer.push(newLayer);
    });

    json.connections.forEach((con) => {
      let leftNode: Node = new Node();
      let rightNode: Node = new Node();
      nn.layer.forEach((layer) => {
        layer.nodes.forEach((node) => {
          if (con.leftNodeId == node.id) leftNode = node;
          if (con.rightNodeId == node.id) rightNode = node;
        });
      });

      const connection = new Connection(
        leftNode,
        rightNode,
        con.weight,
        con.id
      );

      leftNode?.rightConnections.push(connection);
      rightNode?.leftConnections.push(connection);
    });

    return nn;
  }
}

class ActivationFunctions {
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
}

class Layer {
  static idCounter = 0;

  id: number;
  size: number;
  nodes: Node[];

  constructor(size: number, id?: number) {
    this.id = id ?? ++Layer.idCounter;
    this.size = size;
    this.nodes = [];

    for (let i = 0; i < this.size; i++) {
      this.nodes.push(new Node());
    }
  }
}

class Node {
  static idCounter = 0;

  id: number;
  value: number;
  bias: number;
  leftConnections: Connection[];
  rightConnections: Connection[];
  biasError: number;
  outputError: number;

  constructor(bias = 0, id?: number) {
    this.id = id ?? ++Node.idCounter;
    this.value = 0;
    this.bias = bias;
    this.leftConnections = [];
    this.rightConnections = [];
    this.biasError = 0;
    this.outputError = 0;
  }
}

class Connection {
  static idCounter = 0;

  id: number;
  weight: number;
  leftNode: Node;
  rightNode: Node;

  constructor(leftNode: Node, rightNode: Node, weight?: number, id?: number) {
    this.id = id ?? ++Connection.idCounter;
    this.weight = weight ?? Math.random() * 2 - 1;
    this.leftNode = leftNode;
    this.rightNode = rightNode;
  }
}

type JSONNN = {
  method: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH";
  learningRate: number;
  layer: JSONLayer[];
  outputLabels: string[];
  nodes: JSONNode[];
  connections: JSONConnection[];
};

type JSONLayer = {
  id: number;
  size: number;
  nodes: number[];
};

type JSONNode = {
  id: number;
  bias: number;
  leftConnections: number[];
  rightConnections: number[];
};

type JSONConnection = {
  id: number;
  weight: number;
  leftNodeId: number;
  rightNodeId: number;
};
