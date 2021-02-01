import typescript from "rollup-plugin-typescript2";
import json from "@rollup/plugin-json";
import pkg from "./package.json";

export default {
  input: "src/index.ts",
  plugins: [
    json(),
    typescript({
      typescript: require("typescript"),
    }),
  ],
  output: [
    { file: pkg.main, format: "cjs" },
    { file: pkg.module, format: "esm" },
  ],
  external: [
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
};
