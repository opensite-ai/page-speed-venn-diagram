import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import babel from "@rollup/plugin-babel";
import postcss from "rollup-plugin-postcss";

const isProduction = process.env.NODE_ENV === "production";

export default {
  input: "src/index.ts",
  output: [
    {
      dir: "dist/esm",
      format: "es",
      sourcemap: !isProduction,
      preserveModules: true,
      preserveModulesRoot: "src",
      exports: "named",
      entryFileNames: "[name].js",
    },
    {
      file: "dist/cjs/index.js",
      format: "cjs",
      sourcemap: !isProduction,
      exports: "named",
    },
  ],
  // Treat React as external, but bundle @upsetjs/venn.js directly to
  // avoid relying on its Node export map (which currently points the
  // CJS "require" entry to a non-existent build/index.js file).
  // This keeps consumption simple for both ESM and CJS environments.
  external: ["react", "react-dom", "d3"],
  plugins: [
    resolve({
      extensions: [".ts", ".tsx", ".js", ".jsx"],
    }),
    commonjs(),
    postcss({
      // Extract compiled CSS modules to a consumable stylesheet
      // This path is relative to the output directory, so for the ESM
      // build it becomes dist/esm/styles/index.css which matches
      // the "./styles" export in package.json
      extract: "styles/index.css",
      modules: true,
      minimize: isProduction,
      sourceMap: !isProduction,
    }),
    typescript({
      tsconfig: "./tsconfig.build.json",
      sourceMap: !isProduction,
      declaration: true,
      declarationDir: "dist/esm",
      outDir: "dist/esm",
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/*.stories.tsx"],
    }),
    babel({
      babelHelpers: "runtime",
      exclude: "node_modules/**",
      extensions: [".ts", ".tsx", ".js", ".jsx"],
      presets: [
        [
          "@babel/preset-env",
          {
            modules: false,
            targets: {
              browsers: ["> 1%", "last 2 versions", "not dead"],
            },
          },
        ],
        "@babel/preset-react",
        "@babel/preset-typescript",
      ],
      plugins: ["@babel/plugin-transform-runtime"],
    }),
  ],
  treeshake: {
    moduleSideEffects: false,
  },
};
