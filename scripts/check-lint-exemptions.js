// Fails when a commit adds a file to a lint exemption in .oxlintrc.json: an
// override that turns a rule "off". The lists only shrink, with one way out:
// a move-only split of an exempt file may carry the exemption to the files
// its code moved into. So a new entry passes when the same commit removes
// lines from a file already exempt from that rule.
// Compares the staged .oxlintrc.json with HEAD's. lint-staged runs it when
// .oxlintrc.json is staged.

import { execFileSync } from "node:child_process";

const CONFIG = ".oxlintrc.json";

const git = (...args) =>
  execFileSync("git", args, {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });

const read = (ref) => {
  try {
    return git("show", `${ref}:${CONFIG}`);
  } catch {
    return undefined;
  }
};

// Rule name → the files exempt from it. The config is JSONC with whole-line
// `//` comments only.
const exemptions = (text) => {
  const config = JSON.parse(text.replace(/^\s*\/\/.*$/gm, ""));
  const byRule = new Map();
  for (const { files = [], rules = {} } of config.overrides ?? []) {
    for (const [rule, level] of Object.entries(rules)) {
      if (level !== "off") continue;
      const exempt = byRule.get(rule) ?? new Set();
      for (const file of files) exempt.add(file);
      byRule.set(rule, exempt);
    }
  }
  return byRule;
};

// The staged files this commit removes lines from.
const shrinking = new Set(
  git("diff", "--cached", "--numstat", "--no-renames")
    .split("\n")
    .map((line) => line.split("\t"))
    .filter(([, deleted, file]) => file && Number(deleted) > 0)
    .map(([, , file]) => file)
);

const before = read("HEAD");
const after = read("");
if (before === undefined || after === undefined) process.exit(0);

const was = exemptions(before);
const isSplitting = (rule) =>
  [...(was.get(rule) ?? [])].some((file) => shrinking.has(file));

const added = [...exemptions(after)].flatMap(([rule, files]) =>
  [...files]
    .filter((file) => !was.get(rule)?.has(file) && !isSplitting(rule))
    .map((file) => `  ${rule}: ${file}`)
);

if (added.length > 0) {
  console.error(`These lint exemptions are new in ${CONFIG}:\n
${added.join("\n")}

An exemption list only shrinks. Remove these entries and make the code pass
the rule: split the long function or file, or reduce the parameters or
nesting. The one exception is a move-only split of a file that already has
the exemption: commit the split with the exempt file's shrinking, and the new
files may carry its exemption.`);
  process.exit(1);
}
