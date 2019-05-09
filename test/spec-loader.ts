import * as fs from "fs";
import * as _ from "lodash";
import Mocha from "mocha";

const argv = require("minimist")(process.argv.slice(2));
const specs: string[] | undefined = _.isArray(argv.s)
  ? argv.s
  : _.isString(argv.s)
  ? [argv.s]
  : undefined;
const mocha = new Mocha({
  timeout: 999999,
  fullStackTrace: true
});

export function loadSpecDir(
  dir: string,
  specResolver: (path: string) => void,
  specs?: string[]
) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    if (file.endsWith(".spec.ts")) {
      const specName = file.replace(".spec.ts", "");
      if (
        !specs ||
        _.some(specs, x => x.toLowerCase() === specName.toLowerCase())
      ) {
        specResolver(`${dir}/${file}`);
        // mocha.addFile(`${dir}/${file}`);
      }
    } else if (!file.includes(".")) {
      // folder
      loadSpecDir(`${dir}/${file}`, specResolver, specs);
    }
  }
}

export async function startRunTest(testDir: string) {
  loadSpecDir(
    testDir,
    path => {
      mocha.addFile(path);
    },
    specs
  );
  const failures = await Promise.resolve(
    new Promise<number>(resolve => {
      mocha.run(failures => resolve(failures));
    })
  );
  return failures;
}
