import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

const EM_DASH = String.fromCodePoint(0x20_14);

const MESSAGE =
  "No em dashes in copy or comments. End the sentence or use a comma; an en dash or parentheses is the same tell.";

export const noEmDash = defineRule({
  create(context) {
    const check = (node: ESTree.Node, text: string | null | undefined) => {
      if (text?.includes(EM_DASH)) {
        context.report({ message: MESSAGE, node });
      }
    };
    return {
      JSXText(node) {
        check(node, node.value);
      },
      Literal(node) {
        if (typeof node.value === "string") {
          check(node, node.value);
        }
      },
      Program() {
        for (const comment of context.sourceCode.getAllComments()) {
          if (comment.value.includes(EM_DASH)) {
            context.report({ loc: comment.loc, message: MESSAGE });
          }
        }
      },
      TemplateElement(node) {
        check(node, node.value.cooked);
      },
    };
  },
  meta: {
    docs: {
      description:
        "Disallow em dashes in strings, JSX text and comments, the prose people and agents read.",
    },
    type: "suggestion",
  },
});
