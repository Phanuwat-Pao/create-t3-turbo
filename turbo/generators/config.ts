import { execSync } from "node:child_process";

import type { PlopTypes } from "@turbo/gen";

interface PackageJson {
  name: string;
  scripts: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  plop.setGenerator("init", {
    actions: [
      (answers) => {
        if (
          "name" in answers &&
          typeof answers.name === "string" &&
          answers.name.startsWith("@acme/")
        ) {
          answers.name = answers.name.replace("@acme/", "");
        }
        return "Config sanitized";
      },
      {
        path: "packages/{{ name }}/package.json",
        templateFile: "templates/package.json.hbs",
        type: "add",
      },
      {
        path: "packages/{{ name }}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
        type: "add",
      },
      {
        path: "packages/{{ name }}/src/index.ts",
        template: "export const name = '{{ name }}';",
        type: "add",
      },
      {
        path: "packages/{{ name }}/package.json",
        async transform(content, answers) {
          const deps =
            "deps" in answers && typeof answers.deps === "string"
              ? answers.deps.split(" ").filter(Boolean)
              : [];
          // sherif rejects an empty dependencies field, so add one only for
          // real dependencies.
          if (deps.length > 0) {
            const pkg = JSON.parse(content) as PackageJson;
            const versions = await Promise.all(
              deps.map((dep) =>
                fetch(`https://registry.npmjs.org/-/package/${dep}/dist-tags`)
                  .then((res) => res.json())
                  .then((json) => json.latest as string)
              )
            );
            pkg.dependencies ??= {};
            for (const [index, dep] of deps.entries()) {
              pkg.dependencies[dep] = `^${versions[index]}`;
            }
            return JSON.stringify(pkg, null, 2);
          }
          return content;
        },
        type: "modify",
      },
      (answers) => {
        // Install, then let Ultracite format and lint the new package the way
        // the commit hook will.
        if ("name" in answers && typeof answers.name === "string") {
          execSync("pnpm i", { stdio: "inherit" });
          execSync(`pnpm exec ultracite fix packages/${answers.name}`, {
            stdio: "inherit",
          });
          return "Package scaffolded";
        }
        return "Package not scaffolded";
      },
    ],
    description: "Generate a new package for the Acme Monorepo",
    prompts: [
      {
        message:
          "What is the name of the package? (You can skip the `@acme/` prefix)",
        name: "name",
        type: "input",
      },
      {
        message:
          "Enter a space separated list of dependencies you would like to install",
        name: "deps",
        type: "input",
      },
    ],
  });
}
