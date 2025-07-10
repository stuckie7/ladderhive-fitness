// Type definitions for Deno runtime
interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  referrer?: string;
  referrerPolicy?: ReferrerPolicy;
  mode?: RequestMode;
  credentials?: RequestCredentials;
  cache?: RequestCache;
  redirect?: RequestRedirect;
  integrity?: string;
  keepalive?: boolean;
  signal?: AbortSignal | null;
  window?: null;
}

declare class Request {
  constructor(input: RequestInfo, init?: RequestInit);
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  readonly redirect: RequestRedirect;
  readonly signal: AbortSignal;
  readonly keepalive: boolean;
  readonly referrer: string;
  readonly referrerPolicy: ReferrerPolicy;
  readonly credentials: RequestCredentials;
  readonly cache: RequestCache;
  readonly mode: RequestMode;
  readonly integrity: string;
  readonly destination: RequestDestination;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  clone(): Request;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare class Headers {
  constructor(init?: HeadersInit);
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  has(name: string): boolean;
  set(name: string, value: string): void;
  forEach(callbackfn: (value: string, key: string, parent: Headers) => void, thisArg?: any): void;
  [Symbol.iterator](): IterableIterator<[string, string]>;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
}

declare class Response {
  constructor(body?: BodyInit | null, init?: ResponseInit);
  static error(): Response;
  static redirect(url: string, status?: number): Response;
  static json(data: any, init?: ResponseInit): Response;
  readonly headers: Headers;
  readonly ok: boolean;
  readonly redirected: boolean;
  readonly status: number;
  readonly statusText: string;
  readonly type: ResponseType;
  readonly url: string;
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  clone(): Response;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<any>;
  text(): Promise<string>;
}

interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}

type HeadersInit = Headers | string[][] | Record<string, string>;
type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array> | string;
type RequestInfo = Request | string;

declare const Request: {
  prototype: Request;
  new(input: RequestInfo, init?: RequestInit): Request;
};

declare const Response: {
  prototype: Response;
  new(body?: BodyInit | null, init?: ResponseInit): Response;
  error(): Response;
  redirect(url: string, status?: number): Response;
  json(data: any, init?: ResponseInit): Response;
};

declare const Headers: {
  prototype: Headers;
  new(init?: HeadersInit): Headers;
};

declare const fetch: typeof globalThis.fetch;
