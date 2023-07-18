import { NeuralNetwork } from "../app.ts";
import { LSTM } from "./LSTM.ts";

export class EncoderDecoder {
  private encoder: Encoder;
  private decoder: Decoder;

  constructor(layers = 1) {
    this.encoder = new Encoder(layers);
    this.decoder = new Decoder(layers);
  }
}

class Encoder {
  private EmbeddingLayer: NeuralNetwork;
  private LSTMLayers: LSTM[][];

  constructor(layers = 1) {
    this.EmbeddingLayer = new NeuralNetwork([32, 32]);
    this.LSTMLayers = [];

    for (let i = 0; i < layers; i++) {
      for (let j = 0; j < 32; j++) {
        this.LSTMLayers[i].push(new LSTM());
      }
    }
  }
}

class Decoder {
  private EmbeddingLayer: NeuralNetwork;
  private LSTMLayers: LSTM[][];
  private FullyConnectedLayer: NeuralNetwork;

  constructor(layers = 1) {
    this.EmbeddingLayer = new NeuralNetwork([32, 32]);
    this.LSTMLayers = [];
    this.FullyConnectedLayer = new NeuralNetwork([32, 32]);

    for (let i = 0; i < layers; i++) {
      for (let j = 0; j < 32; j++) {
        this.LSTMLayers[i].push(new LSTM());
      }
    }
  }
}
