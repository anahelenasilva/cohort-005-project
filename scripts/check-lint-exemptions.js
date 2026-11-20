// Fails when a commit adds a file to a lint exemption in .oxlintrc.json: an
// override that turns a rule "off". The lists only shrink, with one way out:
// a move-only split of an exempt file may carry the exemption to the files
// its code moved into. A new entry passes only when the file is new in this
// commit and the files already exempt from that rule lose at least half as
// many lines as the new files hold (the rest is room for their imports).
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

const before = read("HEAD");
const after = read("");
if (before === undefined || after === undefined) process.exit(0);

// Per staged file: lines added and deleted. A file absent from HEAD is new.
const changes = new Map(
  git("diff", "--cached", "--numstat", "--no-renames")
    .split("\n")
    .map((line) => line.split("\t"))
    .filter(([, , file]) => file)
    .map(([added, deleted, file]) => [
      file,
      { added: Number(added) || 0, deleted: Number(deleted) || 0 },
    ])
);
const created = new Set(
  git("diff", "--cached", "--name-only", "--no-renames", "--diff-filter=A")
    .split("\n")
    .filter(Boolean)
);

const was = exemptions(before);
const sum = (files, key) =>
  files.reduce((total, file) => total + (changes.get(file)?.[key] ?? 0), 0);

const rejected = [...exemptions(after)].flatMap(([rule, files]) => {
  const fresh = [...files].filter((file) => !was.get(rule)?.has(file));
  if (fresh.length === 0) return [];
  const isMove =
    fresh.every((file) => created.has(file)) &&
    sum([...(was.get(rule) ?? [])], "deleted") * 2 >= sum(fresh, "added");
  return isMove ? [] : fresh.map((file) => `  ${rule}: ${file}`);
});

if (rejected.length > 0) {
  console.error(`These lint exemptions are new in ${CONFIG}:\n
${rejected.join("\n")}

An exemption list only shrinks. Remove these entries and make the code pass
the rule: split the long function or file, or reduce the parameters or
nesting. The one exception is a move-only split: a file created in the same
commit, holding code moved out of a file that already has the exemption, may
carry that exemption.`);
  process.exit(1);
}
