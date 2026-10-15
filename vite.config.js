// `@engine/…` is the shared engine in engine/src (a copy of LoLBookEngine, see engine/docs/ENGINE.md).
import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

export default defineConfig({
  resolve: { alias: { '@engine': fileURLToPath(new URL('./engine/src', import.meta.url)) } },
});
