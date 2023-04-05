import { ArriensNetwork } from "./src/ArriensNetwork.ts";
import { readCSV } from "./src/csv.ts";
import { DataFrame } from "./src/DataFrame.ts";
import { NeuralNetwork } from "./src/NeuralNetwork.ts";

const dataScience = {
  readCSV,
  DataFrame,
  NeuralNetwork,
};

export { readCSV, DataFrame, NeuralNetwork, ArriensNetwork };

export default dataScience;
