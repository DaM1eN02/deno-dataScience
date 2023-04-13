# readCSV(file, separator = ";", header?)
This function reads a CSV file and returns a `DataFrame` object.

<br></br>
## Parameters
- `file`: string: A string containing the file name of the CSV file to be read from.
- `separator`: string: A string representing the character which separates the CSV data. The default value is ";".
- `header`: string[] | undefined: An optional array of column names for the DataFrame. If not provided, the first row of the CSV file is used as the header.

- Returns `DataFrame`: A `DataFrame` object.

- Exceptions `Error`: If the file name provided does not end with the .csv extension, an error is thrown.

<br></br>
## Example
```typescript
import * as ds from "https://deno.land/x/data_science@0.1.4/app.ts";

const df = ds.readCSV("data.csv", ",", ["col1", "col2", "col3"]);
```

This example reads a CSV file named data.csv, using , as the `separator`, and explicitly defines the column names as col1, col2, and col3. The resulting `DataFrame` object is stored in the `df` variable. If the `file` does not end with the .csv extension, an `error` is thrown. If the column names are not provided, the first row of the CSV file is used as the `header`.

<br></br>
<br></br>
# Class: DataFrame
The `DataFrame` class represents a data frame object that can be used to manipulate and analyze tabular data.

## Class Signature
```typescript
export class DataFrame {
  public header: string[];

  constructor(name: string, data: string[][]);

  readCSV(file: string, seperator = ";", header?: string[]): DataFrame;
  getCol(name: string): Column;
  setCol(name: string, data: []): void;
  head(count: number): string[][];
}
```

<br></br>
## Class Methods
### `constructor`
Creates a new instance of the `DataFrame` class with the specified `header` and `data`.
```typescript
constructor(header: string[], data: string[][]): DataFrame
```

#### Parameters
- `header`: string[] - Array of column names for the data frame
- `data`: string[][] - Array of data for the data frame

<br></br>
### `readCSV`
Reads a csv file and returns a new instance of the `DataFrame` class with the specified header and data.
```typescript
readCSV(file: string, seperator = ";", header?: string[]): DataFrame
```

#### Parameters
- `file` : string - File name of the csv file to read from
- `seperator` : string - Char, which seperates the csv data. Default value is `";"`
- `header` : string[] - Array of column names for the data frame. Default value is the first row of the csv file

<br></br>
### `getCol`
Returns the column with the specified name as a Column object.
```typescript
getCol(name: string): Column
```

#### Parameters
- `name` : string - Name of the Column

<br></br>
### `setCol`
Replaces a Column in the DataFrame with the specified data.
```typescript
setCol(name: string, data: any[]): void
```

#### Parameters
- `name` : string - Name of the Column
- `data` : any[] - Data to replace in the DataFrame

<br></br>
### `head`
Returns the specified number of rows from the top of the DataFrame as a two-dimensional array of strings.
```typescript
head(count: number): string[][]
```

#### Parameters
- `count` : number - Number of rows to return

<br></br>
## Example
```typescript
import * as ds from "https://deno.land/x/data_science@0.1.4/app.ts";

// Read the CSV file and create a new DataFrame
const df = ds.DataFrame.readCSV("data.csv");

// Get the "age" column
const ageColumn = df.getCol("age");

// Print the first 5 values in the "age" column
console.log(ageColumn.data.slice(0, 5));

// Replace the "age" column with a new array of values
const newAgeColumn = [32, 43, 27, 19, 55];
df.setCol("age", newAgeColumn);

// Print the first 5 values in the "age" column again
console.log(df.getCol("age").head(5));

// Print the first 10 rows of the DataFrame
console.log(df.head(10));
```

<br></br>
<br></br>
# Class: Column
This is a class that represents a column in a `DataFrame`. It stores the column name and an array of data.
<br></br>
## Class Signature
```typescript
export class Column {
  public name: string;
  public data: string[];

  constructor(name: string, data: string[]);

  apply(func: CallableFunction): void;
  head(count: number): string[];
}
```
<br></br>
## Class Methods

### `constructor`
This is the constructor method of the Column class.

```typescript
constructor(name: string, data: string[]);
```

#### Parameters
- `name` : The name of the column.
- `data` : An array of data representing the column.

<br></br>
### `apply`
This method applies a function to every item in the data array of the column.

```typescript
apply(func: CallableFunction): void;
```

#### Parameters
- `func` : The function to be applied to each item in the data array.

<br></br>
### `head`
Returns the amount of items given from the top
```typescript
head(count: number): string[];
```

#### Parameters
- `count` : Number of items to return

<br></br>
## Example
```typescript
import * as ds from "https://deno.land/x/data_science@0.1.4/app.ts";

const df = ds.readCSV("fruitNames.csv");
const column = df.getCol("fruits");

console.log(column.head(5));
// Output: ["Apple", "Banana", "Cherry", "Date", "Elderberry"]

// Apply a function that capitalizes each item in the data array
column.apply((item: string) => item.toUpperCase());

console.log(column.head(5));
// Output: ["APPLE", "BANANA", "CHERRY", "DATE", "ELDERBERRY"]
```

<br></br>
<br></br>
# Class: NeuralNetwork
The `NeuralNetwork` class is a JavaScript implementation of a basic feedforward neural network. It is capable of training on input-output data pairs and making predictions for new input data.

<br></br>
## Constructor
Creates a new instance of the `NeuralNetwork` class.
```typescript
constructor(layerSizes: number[] = [1, 1], outputLabels?: string[], activation: "SIGMOID" | "RELU" | "CAPPED RELU" | "TANH" = "SIGMOID", learningRate: number = 0.01)
```
#### Parameters
- `layerSizes` : an array of integers representing the number of nodes in each layer of the neural network. Must have at least two layers.
- `outputLabels` (optional): an array of strings representing the labels for the output layer. If not provided, the labels will be generated automatically based on the number of nodes in the output layer.
- `activation` (optional): a string representing the activation function to use for the neural network. Can be one of `"SIGMOID"`, `"RELU"`, `"CAPPED RELU"`, or `"TANH"`. Defaults to `"SIGMOID"`.
- `learningRate` (optional): a number representing the learning rate to use for training the neural network. Defaults to `0.01`.

<br></br>
## Methods
### `train(x: number[], y: number[])`
Trains the neural network on a single input-output data pair.

#### Parameters
- `x`: an array of numbers representing the input data.
- `y`: an array of numbers representing the expected output data.

<br></br>
### `fit(x: number[][], y: number[][])`
Trains the neural network on multiple input-output data pairs.

#### Parameters
- `x`: an array of arrays of numbers representing the input data.
- `y`: an array of arrays of numbers representing the expected output data.
  
<br></br>
### `predict(input: number[])`
Makes a prediction for a new input data.

#### Parameters
- `input` : an array of numbers representing the input data.

#### Returns
- A string representing the predicted output label.
  
<br></br>
## Example
```typescript
import * as ds from "https://deno.land/x/data_science@0.1.4/app.ts";

const nn = new ds.NeuralNetwork([2, 2, 1], ["0", "1"]);

const x = [[0,0],[0,1],[1,0],[1,1]];
const y = [[0,1],[0,1],[0,1],[0,1]];

nn.fit(x, y);

console.log(nn.predict([0, 0])); // Output: "0"
console.log(nn.predict([0, 1])); // Output: "1"
console.log(nn.predict([1, 0])); // Output: "1"
console.log(nn.predict([1, 1])); // Output: "0"
```
