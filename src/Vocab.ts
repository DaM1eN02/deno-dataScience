enum Languages {
  "de",
  "en",
  "nl",
}

export const VocabCreator = {
  addVocab(text: string, language: Languages) {
    const tokens = tokenize(text);
    createVocab(tokens, language.toString());
  },
};

function tokenize(text: string): string[] {
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
function createVocab(tokens: string[], vocabLanguage: string) {
  const vocab = readVocab(vocabLanguage);
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

  writeVocab(vocab, vocabLanguage);

  return tokens.map((token) => vocab.find(([_, word]) => word === token)![0]);
}

// Read the vocabulary from the CSV file
function readVocab(vocabLanguage: string): [string, string][] {
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
function writeVocab(vocab: [string, string][], vocabLanguage: string) {
  const vocabText = vocab.map(([id, word]) => `${id}\t\t\t${word}`).join("\n");
  const encoder = new TextEncoder();
  const vocabData = encoder.encode(vocabText);
  Deno.writeFileSync(`./src/vocabulary/${vocabLanguage}.csv`, vocabData);
}
