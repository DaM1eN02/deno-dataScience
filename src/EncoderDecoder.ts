import { NeuralNetwork } from "./NeuralNetwork.ts";
import { LSTM } from "./LSTM.ts";

export class EncoderDecoder {
  private encoder: Encoder;
  private decoder: Decoder;

  constructor(layers = 1, lstmDepth = 1, outputLabels: string[]) {
    this.encoder = new Encoder(layers, lstmDepth);
    this.decoder = new Decoder(layers, lstmDepth, outputLabels);
  }

  get(text: string, vocabLanguage: string) {
    const tokens = this.tokenize(text); // Tokenize the input text
    const indexedTokens = this.createVocab(tokens, vocabLanguage); // Create vocabulary and convert tokens to indices
    const vectors = this.vectorize(indexedTokens); // Convert indexed tokens to one-hot encoded vectors

    const memory = this.encoder.forward(vectors);

    const input = Array.from({ length: 1 }, () => this.oneHotEncoding(0));
    return this.decoder.forward(input, memory);
  }

  backpropagate(expectedOutput: number[]) {
    this.decoder.backpropagate(expectedOutput);
  }

  // Tokenize the text
  private tokenize(text: string): string[] {
    const tokens: string[] = [];
    for (let i = 0; i < text.length; i++) {
      let word = "";
      while (text.charAt(i).match(/[A-Za-zäöüß]/gm)) {
        word += text.charAt(i);
        i++;
        if (text.charAt(i) == "'") i++;
      }
      tokens.push(word);
    }
    return tokens
      .filter((token) => token.length > 1)
      .map((token) => token.toLowerCase());
  }

  // Create vocabulary and convert tokens to indices
  private createVocab(tokens: string[], vocabLanguage: string) {
    const vocab = this.readVocab(vocabLanguage);
    const existingWords = new Set(vocab.map((entry) => entry[1]));

    tokens.forEach((token) => {
      if (!existingWords.has(token)) {
        const newIndex = vocab.length.toString();
        vocab.push([newIndex, token]);
        existingWords.add(token);
      }
    });

    vocab.sort((a, b) => {
      if (a[1] > b[1]) return 1;
      if (a[1] < b[1]) return -1;
      else return 0;
    });

    vocab.forEach((value, id) => {
      value[0] = id.toString();
    });

    this.writeVocab(vocab, vocabLanguage);

    return tokens.map((token) => vocab.find(([_, word]) => word === token)![0]);
  }

  // Read the vocabulary from the CSV file
  private readVocab(vocabLanguage: string): [string, string][] {
    try {
      const vocabContent = Deno.readFileSync(
        `./src/vocabulary/${vocabLanguage}.csv`
      );
      const decoder = new TextDecoder();
      const vocabText = decoder.decode(vocabContent);
      const lines = vocabText
        .split("\n")
        .filter((line) => line.trim().length > 0);

      return lines.map((line) => {
        const [id, word] = line.split("\t\t\t");
        return [id, word];
      });
    } catch (_error) {
      return [["0", "."]]; // Return a default entry if the file doesn't exist or there was an error
    }
  }

  // Write the vocabulary to the CSV file
  private writeVocab(vocab: [string, string][], vocabLanguage: string) {
    const vocabText = vocab
      .map(([id, word]) => `${id}\t\t\t${word}`)
      .join("\n");
    const encoder = new TextEncoder();
    const vocabData = encoder.encode(vocabText);
    Deno.writeFileSync(`./src/vocabulary/${vocabLanguage}.csv`, vocabData);
  }

  // Enforce fixed sequence length of 32 and vectorize the indexed tokens
  private vectorize(indexedTokens: string[]) {
    // Perform vectorization on the sequences
    const vectors = indexedTokens.map((token) =>
      this.oneHotEncoding(parseInt(token))
    );

    return vectors;
  }

  // Perform binary encoding with fixed length
  private oneHotEncoding(wordIndex: number): number[] {
    const binaryVector: number[] = Array(32).fill(0);
    const binaryRepresentation = wordIndex.toString(2).padStart(32, "0");

    for (let i = 0; i < 25; i++) {
      binaryVector[i] = parseInt(binaryRepresentation[i]);
    }

    return binaryVector;
  }
}

export class Encoder {
  private EmbeddingLayer: NeuralNetwork;
  private LSTMLayers: LSTM[][];
  // public memory: { LTM: number[]; STM: number[] }[];

  constructor(layers = 1, lstmDepth: number) {
    this.EmbeddingLayer = new NeuralNetwork([32, lstmDepth]);
    this.LSTMLayers = [];

    for (let i = 0; i < layers; i++) {
      const layer: LSTM[] = [];
      this.LSTMLayers.push(layer);
      for (let j = 0; j < lstmDepth; j++) {
        this.LSTMLayers[i].push(new LSTM());
      }
    }
  }

  forward(x: number[][]) {
    for (let i = 0; i < x.length; i++) {
      this.EmbeddingLayer.predict(x[i]);

      const outputs = this.EmbeddingLayer.network[
        this.EmbeddingLayer.network.length - 1
      ].map((node) => node[0]);

      this.LSTMLayers.forEach((layer) => {
        layer.forEach((lstm, index) => {
          lstm.calc(outputs[index]);
          outputs[index] = lstm.STM;
        });
      });
    }

    return this.LSTMLayers.map((layer) =>
      layer.map((lstm) => {
        return { LTM: lstm.LTM, STM: lstm.STM };
      })
    );
  }
}

export class Decoder {
  private EmbeddingLayer: NeuralNetwork;
  private LSTMLayers: LSTM[][];
  private FullyConnectedLayer: NeuralNetwork;

  constructor(layers = 1, lstmDepth: number, outputLabels: string[]) {
    this.EmbeddingLayer = new NeuralNetwork([32, lstmDepth]);
    this.LSTMLayers = [];
    this.FullyConnectedLayer = new NeuralNetwork(
      [lstmDepth, outputLabels.length],
      "RELU",
      0.01,
      outputLabels
    );

    for (let i = 0; i < layers; i++) {
      const layer: LSTM[] = [];
      this.LSTMLayers.push(layer);
      for (let j = 0; j < lstmDepth; j++) {
        this.LSTMLayers[i].push(new LSTM());
      }
    }
  }

  forward(x: number[][], memory: { LTM: number; STM: number }[][]) {
    for (let i = 0; i < memory.length; i++) {
      for (let j = 0; j < memory[i].length; j++) {
        this.LSTMLayers[i][j].LTM = memory[i][j].LTM;
        this.LSTMLayers[i][j].STM = memory[i][j].STM;
      }
    }

    for (let i = 0; i < x.length; i++) {
      this.EmbeddingLayer.predict(x[i]);

      const outputs = this.EmbeddingLayer.network[
        this.EmbeddingLayer.network.length - 1
      ].map((node) => node[0]);

      this.LSTMLayers.forEach((layer) => {
        layer.forEach((lstm, index) => {
          lstm.calc(outputs[index]);
          outputs[index] = lstm.STM;
        });
      });
    }

    const inputs = this.LSTMLayers[this.LSTMLayers.length - 1].map((lstm) => {
      return lstm.STM;
    });

    console.log(
      this.FullyConnectedLayer.network[
        this.FullyConnectedLayer.network.length - 1
      ].map((node) => node[0])
    );
    return this.FullyConnectedLayer.predict(inputs);
  }

  backpropagate(expectedOutput: number[]) {
    this.FullyConnectedLayer.backpropagate(expectedOutput);
  }
}
