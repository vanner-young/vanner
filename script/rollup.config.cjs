const path = require("path");
const { defineConfig } = require("rollup");
const RollupCommon = require("@rollup/plugin-commonjs");
const RollupNodeResolve = require("@rollup/plugin-node-resolve");
const RollupCleanDir = require("./plugin/CleanDir.js");
const RollupResolveJSON = require("@rollup/plugin-json");

module.exports = () =>
    defineConfig({
        input: path.resolve(__dirname, "../lib/index.js"),
        output: {
            file: path.resolve(__dirname, "../bundle/index.js"),
            format: "commonjs",
        },
        plugins: [
            RollupNodeResolve({
                mainFields: ["main", "module"],
            }),
            RollupCommon(),
            RollupCleanDir(),
            RollupResolveJSON(),
        ],
    });
