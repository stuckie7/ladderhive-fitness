// Type definitions for Web APIs used in Supabase Edge Functions

// Request interface
declare interface RequestInit {
  method?: string;
  headers?: HeadersInit;
  body?: BodyInit | null;
  redirect?: RequestRedirect;
  signal?: AbortSignal | null;
}

declare interface Request extends Body {
  readonly method: string;
  readonly url: string;
  readonly headers: Headers;
  readonly redirect: RequestRedirect;
  readonly signal: AbortSignal;
  clone(): Request;
}

declare var Request: {
  prototype: Request;
  new(input: RequestInfo | URL, init?: RequestInit): Request;
};

// Response interface
declare interface ResponseInit {
  status?: number;
  statusText?: string;
  headers?: HeadersInit;
}

declare interface Response extends Body {
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
}

declare var Response: {
  prototype: Response;
  new(body?: BodyInit | null, init?: ResponseInit): Response;
  error(): Response;
  redirect(url: string | URL, status?: number): Response;
  json(data: any, init?: ResponseInit): Response;
};

// Headers interface
declare type HeadersInit = Headers | string[][] | Record<string, string>;

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

// URL interface
declare class URL {
  constructor(input: string, base?: string | URL);
  
  hash: string;
  host: string;
  hostname: string;
  href: string;
  readonly origin: string;
  password: string;
  pathname: string;
  port: string;
  protocol: string;
  search: string;
  readonly searchParams: URLSearchParams;
  username: string;
  
  toJSON(): string;
  toString(): string;
}

// URLSearchParams interface
declare class URLSearchParams {
  constructor(init?: string[][] | Record<string, string> | string | URLSearchParams);
  
  append(name: string, value: string): void;
  delete(name: string): void;
  get(name: string): string | null;
  getAll(name: string): string[];
  has(name: string): boolean;
  set(name: string, value: string): void;
  sort(): void;
  forEach(callbackfn: (value: string, key: string, parent: URLSearchParams) => void, thisArg?: any): void;
  [Symbol.iterator](): IterableIterator<[string, string]>;
  entries(): IterableIterator<[string, string]>;
  keys(): IterableIterator<string>;
  values(): IterableIterator<string>;
  toString(): string;
}

// Body interface
declare interface Body {
  readonly body: ReadableStream<Uint8Array> | null;
  readonly bodyUsed: boolean;
  arrayBuffer(): Promise<ArrayBuffer>;
  blob(): Promise<Blob>;
  formData(): Promise<FormData>;
  json(): Promise<any>;
  text(): Promise<string>;
}

declare type BodyInit = Blob | BufferSource | FormData | URLSearchParams | ReadableStream<Uint8Array> | string;

declare type ResponseType = 'basic' | 'cors' | 'default' | 'error' | 'opaque' | 'opaqueredirect';

declare type RequestRedirect = 'follow' | 'error' | 'manual';

// Global fetch
declare function fetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response>;
