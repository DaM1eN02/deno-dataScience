import { ArriensNetwork } from "./src/ArriensNetwork.ts";
import { DataFrame } from "./src/DataFrame.ts";
import { NeuralNetwork } from "./src/NeuralNetwork.ts";
import { RNN } from "./src/RNN.ts";

const readCSV = DataFrame.prototype.readCSV;

const dataScience = {
  readCSV,
  DataFrame,
  NeuralNetwork,
  RNN,
};

export { readCSV, DataFrame, NeuralNetwork, ArriensNetwork, RNN };

export default dataScience;
