import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

interface Case {
  code: string;
  name: string;
  /** Rules expected to report, one entry per diagnostic. */
  reports: string[];
}

const EM = String.fromCodePoint(0x20_14);
const EN = String.fromCodePoint(0x20_13);

const CASES: Case[] = [
  { code: `const a = "plain, text.";`, name: "plain string", reports: [] },
  {
    code: `const a = "one ${EM} two";`,
    name: "em dash in a string",
    reports: ["no-em-dash"],
  },
  {
    code: `const a = \`one ${EM} \${b}\`;`,
    name: "em dash in a template",
    reports: ["no-em-dash"],
  },
  {
    code: `const a = <p>one ${EM} two</p>;`,
    name: "em dash in JSX text",
    reports: ["no-em-dash"],
  },
  {
    code: `// one ${EM} two\nconst a = 1;`,
    name: "em dash in a comment",
    reports: ["no-em-dash"],
  },
  {
    code: `const a = "one ${EN} two";`,
    name: "en dash is not this rule's business",
    reports: [],
  },
  {
    code: `// oxlint-disable-next-line no-console -- debug output\nconsole.log(1);`,
    name: "directive with a reason",
    reports: [],
  },
  {
    code: `// The CLI prints to stdout.\n// oxlint-disable-next-line no-console\nconsole.log(1);`,
    name: "directive explained on the line above",
    reports: [],
  },
  {
    code: `const a = 1;\n// oxlint-disable-next-line no-console\nconsole.log(a);`,
    name: "directive without a reason",
    reports: ["require-suppression-reason"],
  },
  {
    code: `/* eslint-disable no-console, no-alert */\nconsole.log(1);`,
    name: "file-wide block directive without a reason",
    reports: ["require-suppression-reason"],
  },
  {
    code: `// oxlint-disable-next-line no-console\n// oxlint-disable-next-line no-alert\nalert(1);`,
    name: "a stack of directives is not a reason",
    reports: ["require-suppression-reason", "require-suppression-reason"],
  },
  {
    code: `// @ts-expect-error: the types lag the runtime\nconst a: number = "1";`,
    name: "ts directive with a reason",
    reports: [],
  },
  {
    code: `const b = 2;\n// @ts-expect-error\nconst a: number = "1";`,
    name: "ts directive without a reason",
    reports: ["require-suppression-reason"],
  },
];

interface Diagnostic {
  code: string;
  filename: string;
}

function lint(cases: Case[]): Map<string, string[]> {
  const dir = mkdtempSync(path.join(tmpdir(), "acme-oxlint-plugin-"));
  try {
    const config = path.join(dir, "oxlint.json");
    writeFileSync(
      config,
      JSON.stringify({
        jsPlugins: [path.join(import.meta.dirname, "index.ts")],
        rules: {
          "acme/no-em-dash": "error",
          "acme/require-suppression-reason": "error",
        },
      })
    );
    const files = cases.map((testCase, index) => {
      const file = path.join(dir, `case-${index}.tsx`);
      writeFileSync(file, `${testCase.code}\n`);
      return file;
    });
    let output: string;
    try {
      output = execFileSync(
        path.join(import.meta.dirname, "../node_modules/.bin/oxlint"),
        ["-c", config, "-A", "all", "--format", "json", ...files],
        { encoding: "utf-8" }
      );
    } catch (error) {
      // oxlint exits 1 when it reports errors; the JSON is still on stdout.
      output = (error as { stdout: string }).stdout;
    }
    const { diagnostics } = JSON.parse(output) as { diagnostics: Diagnostic[] };
    const byFile = new Map<string, string[]>(files.map((file) => [file, []]));
    for (const diagnostic of diagnostics) {
      byFile
        .get(diagnostic.filename)
        ?.push(diagnostic.code.replace(/^acme\((?<rule>.+)\)$/u, "$<rule>"));
    }
    return new Map(
      cases.map((testCase, index) => [
        testCase.name,
        (byFile.get(files[index] ?? "") ?? []).toSorted(),
      ])
    );
  } finally {
    rmSync(dir, { force: true, recursive: true });
  }
}

// One oxlint run for the whole table; starting it per case costs ~150 ms each.
const results = lint(CASES);

describe("acme oxlint rules", () => {
  it.each(CASES)("$name", ({ name, reports }) => {
    expect(results.get(name)).toEqual(reports.toSorted());
  });
});
