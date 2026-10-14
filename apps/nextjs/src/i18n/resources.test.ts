import en from "./en.json";
import th from "./th.json";

interface Tree {
  [key: string]: string | Tree;
}

function leaves(tree: Tree, prefix = ""): Map<string, string> {
  const out = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "string") {
      out.set(path, value);
    } else {
      for (const [leaf, text] of leaves(value, path)) {
        out.set(leaf, text);
      }
    }
  }
  return out;
}

function placeholders(text: string): string[] {
  return [...text.matchAll(/\{\{(?<name>\w+)\}\}/gu)]
    .map((match) => match.groups?.name ?? "")
    .toSorted();
}

// The root layout ships only the current language to the client, so a key
// missing from one locale has no fallback in Client Components.
describe("translation resources", () => {
  const enLeaves = leaves(en);
  const thLeaves = leaves(th);

  it("has the same keys in en and th", () => {
    expect([...thLeaves.keys()].toSorted()).toEqual(
      [...enLeaves.keys()].toSorted()
    );
  });

  it("uses the same interpolation variables in both locales", () => {
    for (const [key, text] of enLeaves) {
      expect(placeholders(thLeaves.get(key) ?? ""), key).toEqual(
        placeholders(text)
      );
    }
  });
});
