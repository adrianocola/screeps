'use strict';

import fs from "fs";
import clear from "rollup-plugin-clear";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import typescript from "rollup-plugin-typescript2";
import screeps from "rollup-plugin-screeps";

const dest = process.env.DEST;
if (!dest) {
  throw new Error('No destination specified - code will be compiled but not uploaded');
}

if (!fs.existsSync('./screeps.json')) {
  throw new Error('screeps.json not found');
}

const cfgJson = JSON.parse(
  fs.readFileSync('./screeps.json')
);
const cfg = cfgJson[dest];

export default {
  input: 'src/main.ts',
  output: {
    file: 'dist/main.js',
    format: 'cjs',
    sourcemap: true
  },

  plugins: [
    clear({ targets: ['dist'] }),
    resolve({ rootDir: 'src' }),
    commonjs(),
    typescript({ tsconfig: './tsconfig.json' }),
    screeps({ config: cfg, dryRun: cfg == null })
  ]
};
