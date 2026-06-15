import { defineConfig } from "vitest/config";
import path from "node:path";

// Unit tests run in Node (the units under test are pure / fetch-based). The
// `@/` alias mirrors tsconfig so imports match the app.
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/unit/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
