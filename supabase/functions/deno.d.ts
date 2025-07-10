// Basic type definitions for Deno
// These are minimal definitions to get TypeScript to stop complaining

declare namespace Deno {
  export interface Env {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  }

  export const env: Env;
  
  export interface ServeOptions {
    port?: number;
    hostname?: string;
    onListen?: (params: { hostname: string; port: number }) => void;
  }

  export interface RequestEvent {
    request: Request;
    respondWith(response: Response | Promise<Response>): Promise<void>;
  }

  export function serve(handler: (req: Request) => Response | Promise<Response>, options?: ServeOptions): void;
  export function serve(addr: string | number | ServeOptions): void;
  export function serve(addr: string | number | ServeOptions, handler: (req: Request) => Response | Promise<Response>): void;
}

declare const Deno: typeof globalThis.Deno;
