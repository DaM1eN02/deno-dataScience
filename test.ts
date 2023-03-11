import * as dataScience from "./app.ts";

const df = dataScience.readSVG("test.csv");

console.log(df.head(3));
