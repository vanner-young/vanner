import Bun from "bun";

Bun.build({
    target: "bun",
    entrypoints: ["src/main.ts"],
    outdir: "./bundle",
    external: ["bun"],
    splitting: true, // 启用代码分割, 会将多个依赖的文件,抽离出来单独一个文件
    minify: false, // 启动代码混淆和代码压缩
});
