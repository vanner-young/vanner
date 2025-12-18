import * as path from "node:path";
import { version } from "@/package.json";
import { getAppData } from "mv-common/pkg/node/m.process";
import { isValidUrl } from "mv-common/pkg/index";
import { getFileExtension } from "@vanner/common";

// 工具配置信息
export const app_config = {
    app_version: version, // 命令行版本
    app_description: "一款可定制、可扩展、便捷式的项目工作命令行工具", //  命令行简介
};

// 支持的包管理器对照表
export const package_manger_view = new Map([
    ["npm", "package-lock.json"],
    ["yarn", "yarn.lock"],
    ["pnpm", "pnpm-lock.yaml"],
    ["bun", "bun.lock"],
]);

// 支持的包版本管理工具名称
export const support_package_manger_name = ["npm", "pnpm", "yarn", "bun"];

// 支持的node版本-主版本(大于等于此版本)
export const support_node_version = 20;

// 程序环境目录路径
export const app_cache_path = () =>
    path.resolve(getAppData(), process.env.APP_NAME as string);

// 工具配置持久化缓存路径
export const config_tool_file_path = () =>
    path.resolve(app_cache_path(), ".Cache/config/config.ini");

// git 提交类型列表
const commit_type_list = {
    feat: "新功能开发",
    fix: "修复问题",
    docs: "新增文档注释",
    style: "新增代码格式(不影响代码运行的变动)",
    refactor: "重构或优化代码",
    perf: "对代码进行性能优化",
    test: "增加测试",
    chore: "构建过程或辅助工具的调整",
    revert: "代码回退",
};

// 默认工具配置参数信息
export const config_default_option = {
    main_branch_name: {
        value: "master", // 收保护的分支名称
    },
    branch_secure: {
        value: true, // 分支保护，在对分支操作时，['master']分支不可删除
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
    },
    init_storage_pull: {
        value: false, // 初始化Git仓库时，是否需要拉取一次仓库的代码
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
    },
    request_timeout: {
        value: 3000, // 请求超时时长，单位: ms
        require: (val: any) => /^-?\d+$/.test(val),
        error: `值只能设置为数字(包含负数)`,
    },
    mirror_registry: {
        value: "https://registry.npmmirror.com/", // 默认包版本工具的镜像
        require: (val: any) => isValidUrl(val),
        error: `值只能设置为一个有效的http或https链接地址`,
    },
    package_cli: {
        value: "npm", // 默认的包管理工具
        require: (val: any) => support_package_manger_name.includes(val),
        error: `只能设置为：${support_package_manger_name.join("、")} 的一种`,
    },
    commit_type: {
        value: "fix", // 提交代码时，默认选中的提交类别
        require: (val: any) => Object.keys(commit_type_list).includes(val),
        error: `只能设置为：${Object.keys(commit_type_list).join("、")} 的一种`,
    },
    exec_file_name: {
        value: "index.js", // 执行文件时，默认执行的文件名称
        require: (val: any) => {
            const ext = getFileExtension(val);
            return ["js", "ts"].includes(ext || "");
        },
        error: `只能设置为：js、ts 的一种`,
    },
    publish_npm: {
        value: false, // publish 时是否发布至 npm
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
    },
    install_use_mirror: {
        value: false, // 装包时，是否使用 mirror_registry 镜像
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
    },
};
