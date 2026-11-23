import { randomBytes } from "node:crypto";
import zlib from "node:zlib";

import { syncFlushByDefault } from "./streaming-gzip";

/** Gzips `parts` the way a streamed page goes out, flushing after each one, and returns the compressed bytes. */
function streamed(parts: Buffer[], kind?: number): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const gzip = zlib.createGzip();
    const out: Buffer[] = [];
    gzip.on("data", (chunk: Buffer) => out.push(chunk));
    gzip.on("end", () => resolve(Buffer.concat(out)));
    gzip.on("error", reject);
    for (const part of parts) {
      gzip.write(part);
      if (kind === undefined) {
        gzip.flush();
      } else {
        gzip.flush(kind);
      }
    }
    gzip.end();
  });
}

describe("syncFlushByDefault", () => {
  // Incompressible on its own, so only a back-reference to the previous chunk can shrink the second copy.
  const chunk = Buffer.from(randomBytes(8 * 1024).toString("base64"));

  it("keeps the compression window across flushes", async () => {
    syncFlushByDefault();
    const twice = await streamed([chunk, chunk]);
    const once = await streamed([chunk]);
    expect(zlib.gunzipSync(twice).equals(Buffer.concat([chunk, chunk]))).toBe(
      true
    );
    // The second copy costs almost nothing when the window survives the flush.
    expect(twice.length).toBeLessThan(once.length * 1.1);
  });

  it("still honours a flush kind the caller names", async () => {
    syncFlushByDefault();
    const twice = await streamed([chunk, chunk], zlib.constants.Z_FULL_FLUSH);
    const once = await streamed([chunk]);
    expect(twice.length).toBeGreaterThan(once.length * 1.8);
  });
});
