#!/usr/bin/env node
/*
  Usage:
    node server/scripts/convert-sub-to-postOffice.js [absolute-or-relative-path-to-file]

  Default target:
    server/src/utils/postal-code.ts
*/

const fs = require("fs");
const path = require("path");

function main() {
  const serverRoot = path.resolve(__dirname, "..");
  const defaultTarget = path.join(serverRoot, "src", "utils", "postal-code.ts");

  const targetPathArg = process.argv[2];
  const targetFile = targetPathArg
    ? path.resolve(process.cwd(), targetPathArg)
    : defaultTarget;

  if (!fs.existsSync(targetFile)) {
    console.error(`Target file not found: ${targetFile}`);
    process.exit(1);
  }

  const source = fs.readFileSync(targetFile, "utf8");

  // Replace object key `sub:` (with optional spaces) with `postOffice:`
  const pattern = /\bsub\s*:/g;
  const matches = source.match(pattern) || [];

  if (matches.length === 0) {
    console.log("No 'sub:' keys found. Nothing to change.");
    process.exit(0);
  }

  const updated = source.replace(pattern, "postOffice:");

  fs.writeFileSync(targetFile, updated, "utf8");

  console.log(`Replaced ${matches.length} occurrence(s) of 'sub:' with 'postOffice:' in ${targetFile}`);
}

main();
