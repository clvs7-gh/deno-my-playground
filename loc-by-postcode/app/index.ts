import { createRequire } from 'https://deno.land/std/node/module.ts';
import { parse } from 'https://deno.land/std/encoding/csv.ts';
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
const require = createRequire(import.meta.url);
const zip = new (require('./jszip.min'))();
const encoding = require('./encoding.min');

const ZIP_URL: string = Deno.env.get('LBP_ZIP_URL') || '';
if (!ZIP_URL) {
  throw 'Please specify zip url.';
}

interface PostCodeEntry {
  pref: string;
  city: string;
  addr: string;
}

const codeList: { [key: number]: PostCodeEntry } = {};

/** PREPARE **/

async function prepare() {
  // Download Zip
  console.log('Downloading file ...');
  const zipData = await fetch(ZIP_URL).then(r => r.arrayBuffer());
  console.log('Unzipping ...');
  // Get csv data
  await zip.loadAsync(zipData);
  const rawCsvData = await zip.file('KEN_ALL.CSV').async('uint8array');
  // Decode data
  console.log('Parsing CSV ...');
  const csvString = encoding.convert(rawCsvData, { to: 'UNICODE', from: 'SJIS', type: 'string' });
  const csvList = await parse(csvString, { header: false }) as (string[])[];
  console.log('Finalizing ...');
  for (const entry of csvList) {
    codeList[Number(entry[2])] = { pref: entry[6], city: entry[7], addr: entry[8] };
  }
  console.log('Ready!');
}

/** CLI **/

async function interact() {
  const tpr = new TextProtoReader(new BufReader(Deno.stdin));
  const promptString = (new TextEncoder()).encode('Input postcode: ');
  console.log('='.repeat(30));

  // Wait user input
  for (;;) {
    await Deno.stdout.write(promptString);
    const line = await tpr.readLine();
    if (!line || line.length <= 0) {
      // Quit
      console.log('='.repeat(30));
      console.log('Bye!');
      Deno.exit(0);
    }
    if (line.length !== 7) {
      // Rough validation
      console.warn('Invalid postcode.');
      continue;
    }
    const d = codeList[Number(line)];
    if (!d) {
      // On notfound
      console.warn('No such postcode!');
      continue;
    }

    console.log(`Prefecture: ${d.pref}, City: ${d.city}, Address: ${d.addr}`);
  }
}

/** MAIN **/

await prepare();
await interact();
