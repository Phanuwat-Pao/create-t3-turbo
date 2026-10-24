// CommonJS (.cjs) for the same reason as metro.config.cjs.

// Hermes 260318099.0.4, the version react-native 0.88 ships, rejects an async
// arrow whose rest parameter is a pattern, such as
// `async (...[input, options = {}]) => {}`. @orpc/client's createORPCClient
// is written that way, so the Hermes compile fails on `expo export`.
// babel-preset-expo 58.0.18 dropped the transform that covered this, on the
// grounds that Hermes had fixed it (expo/expo#51687); this case was missed
// (expo/expo#51842). This plugin does what the old one did for this case:
// the arrow turns sync and returns an async arrow that runs the body. Delete
// it, with the babel-preset-expo devDependency, once `expo export` succeeds
// without it.
function asyncArrowRestPattern({ types: t }) {
  return {
    name: "async-arrow-rest-pattern",
    visitor: {
      ArrowFunctionExpression(path) {
        const { node } = path;
        const rest = node.params.at(-1);
        if (
          !node.async ||
          !t.isRestElement(rest) ||
          t.isIdentifier(rest.argument)
        ) {
          return;
        }
        const body = t.isBlockStatement(node.body)
          ? node.body
          : t.blockStatement([t.returnStatement(node.body)]);
        node.async = false;
        node.body = t.callExpression(
          t.arrowFunctionExpression([], body, true),
          []
        );
      },
    },
  };
}

function babelConfig(api) {
  api.cache(true);
  return {
    plugins: [asyncArrowRestPattern],
    presets: ["babel-preset-expo"],
  };
}

module.exports = babelConfig;
