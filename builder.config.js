module.exports = {
  entry: "src/index.ts",
  formats: ["cjs", "esm"],
  dts: true,
  sourcemap: true,
  clean: true,
  target: "library",
  external: [],
  bundle: true,
  splitting: false
}