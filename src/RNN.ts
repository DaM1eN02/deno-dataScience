export class RNN {
  private name: string;
  private path: string;

  constructor(name = "RNN") {
    this.name = name;

    // Set the path
    const basePath = Deno.mainModule.split("/").slice(3, -1).join("/");
    this.path = `${basePath}/${this.name}.csv`;
  }

  // Method to train the RNN
  train(text: string) {
    const tokens = this.tokenize(text); // Tokenize the input text
    const indexedTokens = this.createVocab(tokens); // Create vocabulary and convert tokens to indices
    const vectors = this.vectorize(indexedTokens); // Convert indexed tokens to one-hot encoded vectors
    const batches = this.batching(vectors); // Group vectors into batches

    console.log(batches.length);
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
  private createVocab(tokens: string[]) {
    const vocab = this.readVocab();
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

    this.writeVocab(vocab);

    return tokens.map((token) => vocab.find(([_, word]) => word === token)![0]);
  }

  // Read the vocabulary from the CSV file
  private readVocab(): [string, string][] {
    try {
      const vocabContent = Deno.readFileSync(this.path);
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
  private writeVocab(vocab: [string, string][]) {
    const vocabText = vocab
      .map(([id, word]) => `${id}\t\t\t${word}`)
      .join("\n");
    const encoder = new TextEncoder();
    const vocabData = encoder.encode(vocabText);
    Deno.writeFileSync(this.path, vocabData);
  }

  // Enforce fixed sequence length of 32 and vectorize the indexed tokens
  private vectorize(indexedTokens: string[]) {
    const sequences: string[][] = [];

    for (let i = 0; i < indexedTokens.length; i += 32) {
      const sequence = indexedTokens.slice(i, i + 32);
      sequences.push(sequence);
    }

    // Pad the last sequence if it is shorter than 16
    const lastSequence = sequences[sequences.length - 1];
    if (lastSequence.length < 32) {
      const paddingLength = 32 - lastSequence.length;
      const padding = Array.from({ length: paddingLength }, () => "0");
      sequences[sequences.length - 1] = lastSequence.concat(padding);
    }

    // Perform vectorization on the sequences
    const vectorizedSequences = sequences.map((seq) =>
      seq.map((word) => this.oneHotEncoding(parseInt(word)))
    );

    return vectorizedSequences;
  }

  // Group vectors into batches
  private batching(vectors: number[][][]) {
    const batches: number[][][][] = [];

    vectors.forEach((vector, id) => {
      const batchIndex = Math.floor(id / 32);
      if (!batches[batchIndex]) {
        batches[batchIndex] = [];
      }

      batches[batchIndex].push(vector);
    });

    return batches;
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

// private updateVocab() {
//   const vocab = this.readVocab();
//   const nn = new NeuralNetwork(
//     [vocab.length, 8, 8, 8, 8, 8, vocab.length],
//     vocab.map((entry) => entry[1])
//   );

//   // 30 epochs
//   for (let j = 0; j < 10; j++) {
//     // Predicte next word
//     for (let i = 0; i < vocab.length - 1; i++) {
//       const inputArray = Array.from({ length: vocab.length }, () => 0);
//       const outputArray = Array.from({ length: vocab.length }, () => 0);
//       inputArray[i] = 1;
//       outputArray[i + 1] = 1;

//       nn.train(inputArray, outputArray);
//     }

//     // Predicte in-between word
//     for (let i = 1; i < vocab.length - 1; i++) {
//       const inputArray = Array.from({ length: vocab.length }, () => 0);
//       const outputArray = Array.from({ length: vocab.length }, () => 0);
//       inputArray[i - 1] = 1;
//       inputArray[i + 1] = 1;
//       outputArray[i] = 1;

//       nn.train(inputArray, outputArray);
//     }

//     // Predicte sourrounding words
//     for (let i = 1; i < vocab.length - 1; i++) {
//       const inputArray = Array.from({ length: vocab.length }, () => 0);
//       const outputArray = Array.from({ length: vocab.length }, () => 0);
//       inputArray[i] = 1;
//       outputArray[i + 1] = 1;
//       outputArray[i - 1] = 1;

//       nn.train(inputArray, outputArray);
//     }
//   }

//   const classifications = nn.layer[0].nodes.map((node) =>
//     node.rightConnections.map((con) => con.weight)
//   );

//   // Calculate pairwise cosine similarities
//   const similarities: {
//     indexA: number;
//     indexB: number;
//     similarity: number;
//   }[] = [];
//   for (let i = 0; i < classifications.length; i++) {
//     for (let j = i + 1; j < classifications.length; j++) {
//       const similarity = this.cosineSimilarity(
//         classifications[i],
//         classifications[j]
//       );
//       similarities.push({
//         indexA: i,
//         indexB: j,
//         similarity,
//       }); // Store the index and similarity value
//     }
//   }

//   similarities.sort((a, b) => {
//     if (a.similarity > b.similarity) return -1;
//     else if (a.similarity < b.similarity) return 1;
//     else return 0;
//   });

//   console.log(similarities[0]);
// }

// private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
//   const dotProduct = vectorA.reduce(
//     (acc, val, i) => acc + val * vectorB[i],
//     0
//   );
//   const magnitudeA = Math.sqrt(
//     vectorA.reduce((acc, val) => acc + val * val, 0)
//   );
//   const magnitudeB = Math.sqrt(
//     vectorB.reduce((acc, val) => acc + val * val, 0)
//   );
//   const similarity = dotProduct / (magnitudeA * magnitudeB);
//   return similarity;
// }
