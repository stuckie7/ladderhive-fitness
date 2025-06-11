/// <reference no-default-lib="true" />
/// <reference lib="esnext" />
/// <reference lib="deno.window" />

// Global Deno namespace
declare const Deno: typeof globalThis.Deno & {
  env: {
    get(key: string): string | undefined;
    set(key: string, value: string): void;
    delete(key: string): void;
    toObject(): { [key: string]: string };
  };
  // Add other Deno APIs as needed
};

declare namespace NodeJS {
  interface ProcessEnv {
    [key: string]: string | undefined;
  }
}

declare const process: {
  env: NodeJS.ProcessEnv;
};
