// T3 Code runs this (t3.json) when a thread in its own worktree settles. It
// deletes build caches that rebuild on demand; the Next.js one alone reaches
// gigabytes. node_modules stays, so the thread resumes without a reinstall.
import { rmSync } from "node:fs";
import path from "node:path";

const worktree = path.join(import.meta.dirname, "..");

for (const dir of ["apps/nextjs/.next", ".turbo"]) {
  rmSync(path.join(worktree, dir), { force: true, recursive: true });
}
