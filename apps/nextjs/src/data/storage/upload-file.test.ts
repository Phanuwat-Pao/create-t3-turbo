/* eslint-disable class-methods-use-this, import/first, jest/max-expects, jest/no-hooks, jest/valid-title, no-empty-function, no-use-before-define, typescript-eslint/consistent-type-imports */
const storageRequests = vi.hoisted(() => ({
  requestAbortMultipartUpload: vi.fn(),
  requestCompleteMultipartUpload: vi.fn(),
  requestCreateMultipartUpload: vi.fn(),
  requestCreateUploadUrl: vi.fn(),
  requestSignMultipartPart: vi.fn(),
}));

vi.mock<typeof import("./storage-mutations")>(
  import("./storage-mutations"),
  () => storageRequests
);

import { StorageUploadError, uploadFile } from "./upload-file";

type ProgressListener = (event: ProgressEvent) => void;
type UploadProgressHandler = NonNullable<XMLHttpRequestUpload["onprogress"]>;

function createProgressEvent(
  values: Partial<
    Pick<ProgressEvent, "lengthComputable" | "loaded" | "total">
  > = {}
): ProgressEvent {
  return {
    lengthComputable: true,
    loaded: 0,
    total: 0,
    ...values,
  } as ProgressEvent;
}

class FakeXMLHttpRequest {
  static queue: ((request: FakeXMLHttpRequest) => void)[] = [];
  static requests: FakeXMLHttpRequest[] = [];

  static enqueue(handler: (request: FakeXMLHttpRequest) => void): void {
    FakeXMLHttpRequest.queue.push(handler);
  }

  readonly headers = new Map<string, string>();
  readonly responseHeaders = new Map<string, string>();
  readonly upload: XMLHttpRequestUpload;
  private readonly listeners = new Map<string, Set<ProgressListener>>();
  private readonly uploadListeners = new Map<string, Set<ProgressListener>>();
  body: BodyInit | null = null;
  method: string | null = null;
  onabort:
    | ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any)
    | null = null;
  onerror:
    | ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any)
    | null = null;
  onload:
    | ((this: XMLHttpRequest, ev: ProgressEvent<EventTarget>) => any)
    | null = null;
  readyState = 0;
  response = null;
  responseText = "";
  responseType: XMLHttpRequestResponseType = "";
  status = 0;
  statusText = "";
  url: string | null = null;
  withCredentials = false;

  constructor() {
    this.upload = {
      addEventListener: (
        type: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        const typedListener =
          typeof listener === "function"
            ? (listener as ProgressListener)
            : (event: ProgressEvent) => listener.handleEvent(event);
        const currentListeners = this.uploadListeners.get(type) ?? new Set();
        currentListeners.add(typedListener);
        this.uploadListeners.set(type, currentListeners);
      },
      onprogress: null,
      removeEventListener: (
        type: string,
        listener: EventListenerOrEventListenerObject
      ) => {
        const currentListeners = this.uploadListeners.get(type);

        if (!currentListeners || typeof listener !== "function") {
          return;
        }

        currentListeners.delete(listener as ProgressListener);
      },
    } as XMLHttpRequestUpload;
    FakeXMLHttpRequest.requests.push(this);
  }

  addEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    const typedListener =
      typeof listener === "function"
        ? (listener as ProgressListener)
        : (event: ProgressEvent) => listener.handleEvent(event);
    const currentListeners = this.listeners.get(type) ?? new Set();
    currentListeners.add(typedListener);
    this.listeners.set(type, currentListeners);
  }

  abort(): void {
    this.emit("abort");
  }

  getAllResponseHeaders(): string {
    return [...this.responseHeaders.entries()]
      .map(([key, value]) => `${key}: ${value}`)
      .join("\r\n");
  }

  getResponseHeader(name: string): string | null {
    return this.responseHeaders.get(name.toLowerCase()) ?? null;
  }

  open(method: string, url: string): void {
    this.method = method;
    this.url = url;
  }

  overrideMimeType(): void {}

  removeEventListener(
    type: string,
    listener: EventListenerOrEventListenerObject
  ): void {
    const currentListeners = this.listeners.get(type);

    if (!currentListeners || typeof listener !== "function") {
      return;
    }

    currentListeners.delete(listener as ProgressListener);
  }

  send(body?: BodyInit | null): void {
    this.body = body ?? null;
    const handler = FakeXMLHttpRequest.queue.shift();

    if (!handler) {
      throw new Error(
        `No fake XHR handler queued for ${this.url ?? "<unknown>"}`
      );
    }

    handler(this);
  }

  setRequestHeader(name: string, value: string): void {
    this.headers.set(name.toLowerCase(), value);
  }

  emitProgress(loaded: number, total: number): void {
    const event = createProgressEvent({ loaded, total });
    const handler = this.upload.onprogress as UploadProgressHandler | null;
    handler?.call(this.upload, event);

    for (const listener of this.uploadListeners.get("progress") ?? []) {
      listener(event);
    }
  }

  respond(
    options: {
      headers?: Record<string, string>;
      progress?: { loaded: number; total: number }[];
      status?: number;
    } = {}
  ): void {
    for (const [name, value] of Object.entries(options.headers ?? {})) {
      this.responseHeaders.set(name.toLowerCase(), value);
    }

    for (const entry of options.progress ?? []) {
      this.emitProgress(entry.loaded, entry.total);
    }

    this.status = options.status ?? 200;
    this.emit("load");
  }

  fail(): void {
    this.emit("error");
  }

  private emit(type: "abort" | "error" | "load"): void {
    const event = createProgressEvent();

    if (type === "abort") {
      this.onabort?.call(this as never, event);
    }

    if (type === "error") {
      this.onerror?.call(this as never, event);
    }

    if (type === "load") {
      this.onload?.call(this as never, event);
    }

    for (const listener of this.listeners.get(type) ?? []) {
      listener(event);
    }
  }
}

function createFile(contents: string, name: string, type: string): File {
  return new File([contents], name, {
    type,
  });
}

describe(uploadFile, () => {
  const originalXMLHttpRequest = globalThis.XMLHttpRequest;

  beforeEach(() => {
    FakeXMLHttpRequest.queue = [];
    FakeXMLHttpRequest.requests = [];
    globalThis.XMLHttpRequest = FakeXMLHttpRequest as typeof XMLHttpRequest;
    vi.clearAllMocks();
  });

  afterEach(() => {
    globalThis.XMLHttpRequest = originalXMLHttpRequest;
  });

  it("uploads small files with a single signed PUT request", async () => {
    const file = createFile("tiny", "avatar.png", "image/png");
    const onProgress = vi.fn();

    storageRequests.requestCreateUploadUrl.mockResolvedValue({
      expiresIn: 900,
      key: "users/user_123/uploads/2026/03/avatar.png",
      method: "PUT",
      url: "https://signed.example.com/single",
    });

    FakeXMLHttpRequest.enqueue((request) => {
      request.respond({
        progress: [{ loaded: file.size, total: file.size }],
        status: 200,
      });
    });

    const result = await uploadFile(file, {
      multipartThresholdBytes: 8,
      onProgress,
    });

    expect(storageRequests.requestCreateUploadUrl).toHaveBeenCalledWith({
      contentType: "image/png",
      filename: "avatar.png",
      size: file.size,
    });
    expect(result).toStrictEqual({
      contentType: "image/png",
      filename: "avatar.png",
      key: "users/user_123/uploads/2026/03/avatar.png",
      size: file.size,
      uploadType: "single",
    });
    expect(FakeXMLHttpRequest.requests).toHaveLength(1);
    expect(FakeXMLHttpRequest.requests[0]?.method).toBe("PUT");
    expect(FakeXMLHttpRequest.requests[0]?.headers.get("content-type")).toBe(
      "image/png"
    );
    expect(onProgress).toHaveBeenLastCalledWith({
      loadedBytes: file.size,
      percent: 100,
      stage: "uploading",
      totalBytes: file.size,
      uploadType: "single",
    });
  });

  it("uploads large files with multipart signing, aggregate progress, and completion", async () => {
    const file = createFile("abcdefghij", "report.pdf", "application/pdf");
    const onProgress = vi.fn();

    storageRequests.requestCreateMultipartUpload.mockResolvedValue({
      key: "users/user_123/uploads/2026/03/report.pdf",
      uploadId: "upload-123",
    });
    storageRequests.requestSignMultipartPart
      .mockResolvedValueOnce({
        expiresIn: 900,
        partNumber: 1,
        url: "https://signed.example.com/part-1",
      })
      .mockResolvedValueOnce({
        expiresIn: 900,
        partNumber: 2,
        url: "https://signed.example.com/part-2",
      });
    storageRequests.requestCompleteMultipartUpload.mockResolvedValue({
      key: "users/user_123/uploads/2026/03/report.pdf",
    });

    FakeXMLHttpRequest.enqueue((request) => {
      request.respond({
        headers: { etag: '"etag-1"' },
        progress: [{ loaded: 5, total: 5 }],
      });
    });
    FakeXMLHttpRequest.enqueue((request) => {
      request.respond({
        headers: { etag: '"etag-2"' },
        progress: [{ loaded: 5, total: 5 }],
      });
    });

    const result = await uploadFile(file, {
      concurrency: 2,
      multipartThresholdBytes: 5,
      onProgress,
      partSizeBytes: 5,
    });

    expect(storageRequests.requestCreateMultipartUpload).toHaveBeenCalledWith({
      contentType: "application/pdf",
      filename: "report.pdf",
      size: file.size,
    });
    expect(storageRequests.requestSignMultipartPart).toHaveBeenNthCalledWith(
      1,
      {
        key: "users/user_123/uploads/2026/03/report.pdf",
        partNumber: 1,
        uploadId: "upload-123",
      }
    );
    expect(storageRequests.requestSignMultipartPart).toHaveBeenNthCalledWith(
      2,
      {
        key: "users/user_123/uploads/2026/03/report.pdf",
        partNumber: 2,
        uploadId: "upload-123",
      }
    );
    expect(storageRequests.requestCompleteMultipartUpload).toHaveBeenCalledWith(
      {
        key: "users/user_123/uploads/2026/03/report.pdf",
        parts: [
          { etag: '"etag-1"', partNumber: 1 },
          { etag: '"etag-2"', partNumber: 2 },
        ],
        uploadId: "upload-123",
      }
    );
    expect(result).toStrictEqual({
      contentType: "application/pdf",
      filename: "report.pdf",
      key: "users/user_123/uploads/2026/03/report.pdf",
      size: file.size,
      uploadType: "multipart",
    });
    expect(onProgress).toHaveBeenLastCalledWith({
      loadedBytes: file.size,
      percent: 100,
      stage: "completing",
      totalBytes: file.size,
      uploadType: "multipart",
    });
  });

  it("aborts in-flight uploads when the caller aborts the signal", async () => {
    const file = createFile(
      "abcdefghij",
      "cancel.bin",
      "application/octet-stream"
    );
    const abortController = new AbortController();
    let activeRequest: FakeXMLHttpRequest | undefined;

    storageRequests.requestCreateMultipartUpload.mockResolvedValue({
      key: "users/user_123/uploads/2026/03/cancel.bin",
      uploadId: "upload-123",
    });
    storageRequests.requestSignMultipartPart.mockResolvedValue({
      expiresIn: 900,
      partNumber: 1,
      url: "https://signed.example.com/part-1",
    });
    storageRequests.requestAbortMultipartUpload.mockResolvedValue({
      aborted: true,
      key: "users/user_123/uploads/2026/03/cancel.bin",
    });

    FakeXMLHttpRequest.enqueue((request) => {
      activeRequest = request;
    });

    const uploadPromise = uploadFile(file, {
      multipartThresholdBytes: 5,
      partSizeBytes: 10,
      signal: abortController.signal,
    });

    await vi.waitFor(() => expect(activeRequest).toBeDefined());
    abortController.abort();

    await expect(uploadPromise).rejects.toBeInstanceOf(StorageUploadError);
    await expect(uploadPromise).rejects.toMatchObject({
      code: "ABORTED",
    });
    expect(storageRequests.requestAbortMultipartUpload).toHaveBeenCalledWith({
      key: "users/user_123/uploads/2026/03/cancel.bin",
      uploadId: "upload-123",
    });
  });

  it("best-effort aborts multipart uploads after a failed part upload", async () => {
    const file = createFile(
      "abcdefghij",
      "broken.bin",
      "application/octet-stream"
    );

    storageRequests.requestCreateMultipartUpload.mockResolvedValue({
      key: "users/user_123/uploads/2026/03/broken.bin",
      uploadId: "upload-123",
    });
    storageRequests.requestSignMultipartPart.mockResolvedValue({
      expiresIn: 900,
      partNumber: 1,
      url: "https://signed.example.com/part-1",
    });
    storageRequests.requestAbortMultipartUpload.mockResolvedValue({
      aborted: true,
      key: "users/user_123/uploads/2026/03/broken.bin",
    });

    FakeXMLHttpRequest.enqueue((request) => {
      request.respond({ status: 500 });
    });

    await expect(
      uploadFile(file, {
        multipartThresholdBytes: 5,
        partSizeBytes: 10,
      })
    ).rejects.toMatchObject({
      code: "UPLOAD_FAILED",
    });

    expect(storageRequests.requestAbortMultipartUpload).toHaveBeenCalledWith({
      key: "users/user_123/uploads/2026/03/broken.bin",
      uploadId: "upload-123",
    });
    expect(
      storageRequests.requestCompleteMultipartUpload
    ).not.toHaveBeenCalled();
  });
});
