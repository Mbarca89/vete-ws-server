const fs = require("fs");
const path = require("path");

// Temporary fix: https://github.com/wwebjs/whatsapp-web.js/pull/201923
// When upgrading to a release with the fix, remove this script and postinstall.
const anchor = "        // Bot's won't reply if canonicalUrl is set (linking)";
const fix = "        delete message.__x_id;";

function patchSource(source) {
  const newline = source.includes("\r\n") ? "\r\n" : "\n";
  const replacement = fix + newline + newline + anchor;
  if (source.includes(replacement)) return source;
  if (source.split(anchor).length !== 2) {
    throw new Error("Unexpected whatsapp-web.js source; review the media patch before continuing.");
  }
  return source.replace(anchor, replacement);
}

if (require.main === module) {
  const packagePath = require.resolve("whatsapp-web.js/package.json");
  const { version } = require(packagePath);
  if (version !== "1.34.7") {
    throw new Error(`Review/remove the media patch for whatsapp-web.js ${version}; expected 1.34.7.`);
  }
  const target = path.join(path.dirname(packagePath), "src/util/Injected/Utils.js");
  const source = fs.readFileSync(target, "utf8");
  const patched = patchSource(source);
  if (patched !== source) fs.writeFileSync(target, patched, "utf8");
  console.log("whatsapp-web.js: media ID fix applied (1.34.7).");
}

module.exports = { patchSource };
