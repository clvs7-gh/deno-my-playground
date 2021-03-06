import { createRequire } from "https://deno.land/std/node/module.ts";
const require = createRequire(import.meta.url);
const { Interpreter } = require('./jsi.bundle');
import { assertStrictEquals } from "https://deno.land/std/testing/asserts.ts";

const myCode = await Deno.readTextFile('./sample.js');

const initFunc = (i: any, s: any) => {
  i.setProperty(s, 'test', i.createNativeFunction((text: string) => assertStrictEquals(text, '0, 1, 4, 9, 16, 25, 36, 49, 64, 81')));
  i.setProperty(s, 'sleep', i.createAsyncFunction((timeMs: number, callback: any) => setTimeout(callback, timeMs)));
  i.setProperty(s, 'log', i.createNativeFunction((...po: any[]) => console.log(...po.map(v => i.pseudoToNative(v)))));
};
const myInterpreter = new Interpreter(myCode, initFunc);
const main = async () => {
  while (myInterpreter.run()) {
    await new Promise(r => setTimeout(r,100));
  }
};

await main();
