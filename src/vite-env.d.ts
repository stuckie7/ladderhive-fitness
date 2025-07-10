/// <reference types="vite/client" />

// Add type declarations for path aliases
declare module "@/*" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
