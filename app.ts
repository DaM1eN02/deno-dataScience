import { ArriensNetwork } from "./src/ArriensNetwork.ts";
import { DataFrame, readCSVLight, writeCSV } from "./src/DataFrame.ts";
import { NeuralNetwork } from "./src/NeuralNetwork.ts";
import { LSTM } from "./src/LSTM.ts";
import { ActivationFunctions } from "./src/ActivationFunctions.ts";
import { EncoderDecoder, Encoder } from "./src/EncoderDecoder.ts";

const readCSV = DataFrame.prototype.readCSV;

const dataScience = {
  readCSV,
  readCSVLight,
  DataFrame,
  NeuralNetwork,
  LSTM,
  ActivationFunctions,
  EncoderDecoder,
  Encoder,
  writeCSV,
};

export {
  readCSV,
  readCSVLight,
  DataFrame,
  NeuralNetwork,
  ArriensNetwork,
  LSTM,
  ActivationFunctions,
  EncoderDecoder,
  Encoder,
  writeCSV,
};

export default dataScience;
