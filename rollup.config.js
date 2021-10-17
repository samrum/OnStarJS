import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  plugins: [json(), typescript({ tsconfig: "./tsconfig.json" })],
  output: [
    { file: pkg.main, format: "cjs", exports: "default" },
    { file: pkg.module, format: "esm", exports: "default" },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
    "crypto",
  ],
};
