// Global TypeScript declarations for Deno and Supabase Edge Functions

// Basic Web API types
declare interface Request extends globalThis.Request {}
declare interface Response extends globalThis.Response {}
declare interface Headers extends globalThis.Headers {}
declare interface URL extends globalThis.URL {}
declare interface URLSearchParams extends globalThis.URLSearchParams {}

declare interface FetchEvent extends Event {
  readonly request: Request;
  respondWith(response: Response | Promise<Response>): void;
}

declare interface Window {
  // Add any Window-specific properties here
}

declare const self: Window & typeof globalThis;

declare namespace Deno {
  /** The current process ID for this Deno process. */
  export const pid: number;

  /** The process ID of parent process of this instance of the Deno application. */
  export const ppid: number;

  /** The string URL of the entrypoint for the current program. */
  export const mainModule: string;

  /** A symbol which can be used as a key for a custom method which will be called when `Deno.inspect()` is called. */
  export const customInspect: unique symbol;

  /** The URL of the entrypoint for the current program. */
  export const main: string;

  /** A custom HttpClient for use with the `fetch` API. */
  export const HttpClient: {
    prototype: HttpClient;
    new (): HttpClient;
  };

  /** The current user's home directory. */
  export const home: string;

  /** The current working directory. */
  export const cwd: () => string;

  /** The hostname of the current machine. */
  export const hostname: string;

  /** The operating system platform. */
  export const platform: "darwin" | "linux" | "windows" | "freebsd";

  /** The operating system architecture. */
  export const arch: "x86_64" | "aarch64";

  /** The operating system's default directory for temporary files. */
  export const tmpdir: string;

  /** The path to the current Deno executable. */
  export const execPath: string;

  /** The current version of the Deno runtime. */
  export const version: {
    deno: string;
    v8: string;
    typescript: string;
  };

  /** The current process's environment variables. */
  export const env: {
    /** Retrieve the value of an environment variable. */
    get(key: string): string | undefined;
    /** Set the value of an environment variable. */
    set(key: string, value: string): void;
    /** Delete an environment variable. */
    delete(key: string): void;
    /** Get all environment variables as an object. */
    toObject(): { [key: string]: string };
  };

  /** Exit the current process with the given status code. */
  export function exit(code?: number): never;

  /** The current working directory as a URL. */
  export const cwdUrl: () => URL;

  /** The current working directory as a string. */
  export const cwdStr: () => string;

  /** The current working directory as a string. */
  export const cwd: () => string;

  /** The current working directory as a URL. */
  export const cwdUrl: () => URL;

  /** The current working directory as a string. */
  export const cwdStr: () => string;
}

// Add global Web API types
declare const Response: {
  prototype: Response;
  new(body?: BodyInit | null, init?: ResponseInit): Response;
  error(): Response;
  redirect(url: string, status?: number): Response;
  json(data: any, init?: ResponseInit): Response;
};

declare const Request: {
  prototype: Request;
  new(input: RequestInfo | URL, init?: RequestInit): Request;
};

declare const Headers: {
  prototype: Headers;
  new(init?: HeadersInit): Headers;
};

declare const fetch: typeof globalThis.fetch;
declare const URL: typeof globalThis.URL;
declare const URLSearchParams: typeof globalThis.URLSearchParams;

// Add console to the global scope
declare const console: Console;

// Add global event types
declare function addEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | AddEventListenerOptions
): void;

declare function removeEventListener(
  type: string,
  listener: EventListenerOrEventListenerObject,
  options?: boolean | EventListenerOptions
): void;

// Add global error handling
declare const onerror: OnErrorEventHandler;

// Add global timers
declare function setTimeout(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
declare function clearTimeout(handle?: number): void;
declare function setInterval(handler: TimerHandler, timeout?: number, ...arguments: any[]): number;
declare function clearInterval(handle?: number): void;
