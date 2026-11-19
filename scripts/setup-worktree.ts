// T3 Code runs this (t3.json) after it creates a worktree for a new thread:
// it links the main checkout's .env and installs dependencies.
import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, symlinkSync } from "node:fs";
import path from "node:path";

const worktree = path.join(import.meta.dirname, "..");
const projectRoot = process.env.T3CODE_PROJECT_ROOT;

if (projectRoot) {
  const source = path.join(projectRoot, ".env");
  const target = path.join(worktree, ".env");
  // A .env already in the worktree wins.
  if (existsSync(source) && !lstatSync(target, { throwIfNoEntry: false })) {
    symlinkSync(source, target);
  }
}

// Closed stdin makes a pnpm prompt fail instead of hanging setup. The shell
// finds pnpm's Windows shim.
const install = spawnSync("pnpm install --frozen-lockfile", {
  cwd: worktree,
  shell: true,
  stdio: ["ignore", "inherit", "inherit"],
});
process.exitCode = install.status ?? 1;
