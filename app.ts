import { readCSV } from "./src/csv.ts";
import { DataFrame } from "./src/DataFrame.ts";
import { NeuralNetwork } from "./src/NeuralNetwork.ts";

const dataScience = {
  readCSV,
  DataFrame,
  NeuralNetwork,
};

export { readCSV, DataFrame, NeuralNetwork };

export default dataScience;
