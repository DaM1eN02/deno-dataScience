import { ArriensNetwork } from "./src/ArriensNetwork.ts";
import { DataFrame, readCSVLight } from "./src/DataFrame.ts";
import { NeuralNetwork } from "./src/NeuralNetwork.ts";
import { RNN } from "./src/RNN.ts";
import { LSTM } from "./src/LSTM.ts";
import { ActivationFunctions } from "./src/ActivationFunctions.ts";
import { EncoderDecoder } from "./src/EncoderDecoder.ts";

const readCSV = DataFrame.prototype.readCSV;

const dataScience = {
  readCSV,
  readCSVLight,
  DataFrame,
  NeuralNetwork,
  RNN,
  LSTM,
  ActivationFunctions,
  EncoderDecoder,
};

export {
  readCSV,
  readCSVLight,
  DataFrame,
  NeuralNetwork,
  ArriensNetwork,
  RNN,
  LSTM,
  ActivationFunctions,
  EncoderDecoder,
};

export default dataScience;
