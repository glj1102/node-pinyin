import { startRunTest } from "./spec-loader";

(async () => {
  const failures = await startRunTest("./test");
  return failures;
})()
  .then(failures => {
    process.exitCode = failures;
  })
  .catch(error => {
    console.error(error);
    process.exitCode = -1;
    process.exit();
  });
