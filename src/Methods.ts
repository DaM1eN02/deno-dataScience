import { Column } from "./Column.ts";

export interface MethodInterface {
  fit(x: Column, y: Column): void;
  dump(name: string): void;
  load(name: string): void;
}

export class Method implements MethodInterface {
  fit(x: Column, y: Column): void {}
  dump(name: string): void {
    const encoder = new TextEncoder();
    const path =
      Deno.mainModule.split("/").slice(0, -1).join("/") + "/" + name + ".json";
    Deno.createSync(path);
    Deno.writeFileSync(path, encoder.encode(JSON.stringify(this)));
  }
  load(name: string): void {
    const decoder = new TextDecoder();
    const path =
      Deno.mainModule.split("/").slice(0, -1).join("/") + "/" + name + ".json";
    decoder.decode(Deno.readFileSync(path));
  }
}

export class CountVectorizer extends Method {
  fit(_x: Column, _y: Column): void {}
}

export class TfidfTransformer extends Method {
  fit(_x: Column, _y: Column): void {}
}

export class RandomForestClassifier extends Method {}
