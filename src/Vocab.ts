type Languages = "de" | "en" | "nl" | "fr" | "es";

export const VocabCreator = {
  addVocab(text: string, language: Languages) {
    const tokens = tokenize(text);
    const [vocab, thresholdVocab] = readVocab(language);
    const [newVocab, newThresholdVocab] = createVocab(
      tokens,
      vocab,
      thresholdVocab
    );
    writeVocab(newVocab, newThresholdVocab, language);
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
function createVocab(
  tokens: string[],
  vocab: [string, string, number][],
  thresholdVocab: [string, string, number][]
) {
  const existingWords = new Set(
    vocab
      .map((entry) => entry[1])
      .concat(thresholdVocab.map((entry) => entry[1]))
  );

  tokens.forEach((token) => {
    if (!thresholdVocab.map((entry) => entry[1]).includes(token)) {
      thresholdVocab.push(["1", token, 1]);
      existingWords.add(token);
    } else {
      vocab.find((entry) => entry[1] == token)
        ? vocab[vocab.findIndex((entry) => entry[1] == token)][2]++
        : thresholdVocab[
            thresholdVocab.findIndex((entry) => entry[1] == token)
          ][2]++;
    }
  });

  thresholdVocab.forEach((entry) => {
    if (entry[2] >= 1000) {
      vocab.push(entry);
    }
  });
  thresholdVocab = thresholdVocab.filter((entry) => entry[2] < 1000);

  vocab.sort((a, b) => {
    if (a[2] > b[2]) return -1;
    if (a[2] < b[2]) return 1;
    else return 0;
  });

  thresholdVocab.sort((a, b) => {
    if (a[2] > b[2]) return -1;
    if (a[2] < b[2]) return 1;
    else return 0;
  });

  vocab.forEach((value, id) => {
    value[0] = id.toString();
  });
  thresholdVocab.forEach((value, id) => {
    value[0] = id.toString();
  });

  return [vocab, thresholdVocab];
}

// Read the vocabulary from the CSV file
function readVocab(vocabLanguage: Languages) {
  try {
    const vocabText = Deno.readTextFileSync(
      `./src/vocabulary/${vocabLanguage}.csv`
    );
    const lines = vocabText
      .split("\n")
      .filter((line) => line.trim().length > 0);

    const thresholdVocabText = Deno.readTextFileSync(
      `./src/vocabulary/threshold/${vocabLanguage}.csv`
    );
    const thresholdLines = thresholdVocabText
      .split("\n")
      .filter((line) => line.trim().length > 0);

    const vocab: [string, string, number][] = lines.map((line) => {
      const [id, word, count] = line.split(";");
      return [id, word, parseInt(count)];
    });
    const thresholdVocab: [string, string, number][] = thresholdLines.map(
      (line) => {
        const [id, word, count] = line.split(";");
        return [id, word, parseInt(count)];
      }
    );

    return [vocab, thresholdVocab];
  } catch (_err) {
    const vocab1: [string, string, number][] = [["0", ".", 0]];
    const vocab2: [string, string, number][] = [["0", ".", 0]];
    return [vocab1, vocab2];
  }
}

// Write the vocabulary to the CSV file
function writeVocab(
  vocab: [string, string, number][],
  thresholdVocab: [string, string, number][],
  vocabLanguage: Languages
) {
  const vocabText = vocab
    .map(([id, word, count]) => `${id};${word};${count}`)
    .join("\n");
  const encoder = new TextEncoder();
  const vocabData = encoder.encode(vocabText);
  Deno.writeFileSync(`./src/vocabulary/${vocabLanguage}.csv`, vocabData);

  const thresholdVocabText = thresholdVocab
    .map(([id, word, count]) => `${id};${word};${count}`)
    .join("\n");
  const thresholdVocabData = encoder.encode(thresholdVocabText);
  Deno.writeFileSync(
    `./src/vocabulary/threshold/${vocabLanguage}.csv`,
    thresholdVocabData
  );
}
