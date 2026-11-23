import zlib from "node:zlib";

/*
 * Next.js compresses streamed pages with the `compression` middleware and calls its flush() after every chunk React
 * writes, so the browser can show each part as it arrives. Node's zlib flush() defaults to Z_FULL_FLUSH, which also
 * throws away the compression window, so every chunk is compressed as if nothing came before it. On a page streamed
 * in about 100 chunks that doubles the bytes: 548 KB of HTML went out as 120 KB instead of 64 KB. On a fresh
 * connection far from the server each extra 30 to 60 KB is one more round trip.
 *
 * Z_SYNC_FLUSH sends everything written so far just the same and keeps the window, which is what streaming needs.
 */

/** zlib's flush(kind, callback); its typings overload it, which `.call` cannot pick from. */
type Flush = (this: zlib.Gzip, kind?: number, callback?: () => void) => void;

/** flush() that defaults to Z_SYNC_FLUSH; a caller that names a flush kind still gets that kind. */
const syncFlushOver = (fullFlush: Flush) =>
  function flush(
    this: zlib.Gzip,
    kind?: number | (() => void),
    // oxlint-disable-next-line promise/prefer-await-to-callbacks -- zlib's own flush(kind, callback) signature, which this wraps
    callback?: () => void
  ) {
    if (typeof kind === "number") {
      return fullFlush.call(this, kind, callback);
    }
    return fullFlush.call(
      this,
      zlib.constants.Z_SYNC_FLUSH,
      typeof kind === "function" ? kind : callback
    );
  };

/** Makes Z_SYNC_FLUSH the default flush of gzip and deflate streams in this process. Safe to call twice. */
export function syncFlushByDefault() {
  for (const Stream of [zlib.Gzip, zlib.Deflate]) {
    const prototype = Stream.prototype as zlib.Gzip & { __syncFlush?: true };
    if (prototype.__syncFlush) {
      continue;
    }
    Object.defineProperty(prototype, "flush", {
      configurable: true,
      value: syncFlushOver(prototype.flush as Flush),
      writable: true,
    });
    Object.defineProperty(prototype, "__syncFlush", { value: true });
  }
}
