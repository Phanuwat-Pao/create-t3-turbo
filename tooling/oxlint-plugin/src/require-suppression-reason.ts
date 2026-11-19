import { defineRule } from "@oxlint/plugins";
import type { ESTree } from "@oxlint/plugins";

const DIRECTIVE_PATTERN =
  /^\s*\*?\s*(?:(?:oxlint|eslint)-(?:disable|enable)|@ts-(?:expect-error|ignore|nocheck))/u;
const TS_DIRECTIVE_PATTERN =
  /^\s*\*?\s*@ts-(?:expect-error|ignore|nocheck)(?![\w-])(?<after>.*)$/su;
const EMPTY_COMMENT_PATTERN = /^[\s*]*$/u;

export const requireSuppressionReason = defineRule({
  create(context) {
    const { sourceCode } = context;
    return {
      Program() {
        const comments = sourceCode.getAllComments();
        const ownLineCommentsByEndLine = new Map<number, ESTree.Comment>();
        for (const comment of comments) {
          const { column, line } = comment.loc.start;
          const before = (sourceCode.lines[line - 1] ?? "").slice(0, column);
          if (before.trim() === "") {
            ownLineCommentsByEndLine.set(comment.loc.end.line, comment);
          }
        }

        // A plain comment directly above (past other directives) counts as the reason.
        const explainedAbove = (directive: ESTree.Comment) => {
          let above = ownLineCommentsByEndLine.get(
            directive.loc.start.line - 1
          );
          while (
            above &&
            (DIRECTIVE_PATTERN.test(above.value) ||
              EMPTY_COMMENT_PATTERN.test(above.value))
          ) {
            above = ownLineCommentsByEndLine.get(above.loc.start.line - 1);
          }
          return above !== undefined;
        };

        for (const directive of sourceCode.getDisableDirectives().directives) {
          if (
            directive.type === "enable" ||
            directive.justification.trim() ||
            explainedAbove(directive.node)
          ) {
            continue;
          }
          context.report({
            loc: directive.node.loc,
            message:
              "Say why: end the directive with `-- <reason>` or put a comment on the line above.",
          });
        }

        for (const comment of comments) {
          const after = TS_DIRECTIVE_PATTERN.exec(comment.value)?.groups?.after;
          if (
            after === undefined ||
            after.replace(/^[\s:-]+/u, "").trim() ||
            explainedAbove(comment)
          ) {
            continue;
          }
          context.report({
            loc: comment.loc,
            message:
              "Say why: write the reason after the directive or in a comment on the line above.",
          });
        }
      },
    };
  },
  meta: {
    docs: {
      description: "Require every lint or type-checker suppression to say why.",
    },
    type: "suggestion",
  },
});
