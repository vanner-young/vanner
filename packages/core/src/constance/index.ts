import * as path from "node:path";
import { version } from "@/package.json";
import { getAppData } from "mv-common/pkg/node/m.process";
import { isValidUrl } from "mv-common/pkg/index";

// 支持的node版本-主版本(大于等于此版本)
export const support_node_version = 20;

// 命令行工具简介
export const app_description = "一款可定制、可扩展、便捷式的项目工作命令行工具";

// 支持的包管理器对照表
export const package_manger_view = {
    npm: "package-lock.json",
    yarn: "yarn.lock",
    pnpm: "pnpm-lock.yaml",
    bun: "bun.lock",
};

// git 提交类型列表
export const commit_type_list = {
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

// 支持运行的脚本文件类型
export const support_exec_file = [".js", ".ts", ".html"];

// 工具配置信息
export const app_config = {
    app_version: version, // 命令行版本
    app_description: app_description, //  命令行简介
};

// 支持的包版本管理工具名称
export const support_package_manger_name = Object.keys(package_manger_view);

// 程序环境目录路径
export const app_cache_path = () =>
    path.resolve(getAppData(), process.env.APP_NAME as string);

// 配置文件缓存目录
export const config_cache_dir = () =>
    path.resolve(app_cache_path(), ".Cache/config");

// 配置文件缓存路径 - 工具配置文件
export const config_tool_file_path = () =>
    path.resolve(config_cache_dir(), "config.ini");

// 配置文件缓存路径 - 项目包管理器选择持久化
export const config_pkg_manger_file_path = () =>
    path.resolve(config_cache_dir(), "pkg_manager.ini");

// 用户自定义运行时文件路径
export const config_user_runtime_path = () =>
    path.resolve(app_cache_path(), ".Cache/runtime/customer.runtime.json");

// 默认工具配置参数信息
export const config_default_option = {
    main_branch: {
        value: "master/main",
        require: (val: string) =>
            !val.split("/").find((it) => !["main", "master"].includes(it)),
        error: "值只能设置为main/master",
        description: "主分支名称，设置多个时，通过'/'隔开，用于tag标签",
    },
    mirror_registry: {
        value: "https://registry.npmmirror.com/",
        require: (val: any) => isValidUrl(val),
        error: `值只能设置为一个有效的http或https链接地址`,
        description: "包管理器执行时的代理镜像",
    },
    package_cli: {
        value: "npm",
        require: (val: any) => support_package_manger_name.includes(val),
        error: `只能设置为：${support_package_manger_name.join("、")} 的一种`,
        description: "默认的包管理器名称（项目中的lock文件权重大于此值的设置）",
    },
    unknown_pkg_ask: {
        value: true,
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
        description:
            "遇到未知包管理器时，是否询问用户（true：询问、false: （使用 package_cli 设置的值））",
    },
    install_use_mirror: {
        value: false,
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
        description:
            "装包时，默认是否使用 mirror_registry的值作为安装镜像（用户在命令行中输入的 --registry 权重大于当前值的设置）",
    },
    publish_npm: {
        value: false,
        require: (val: any) => ["true", "false"].includes(val),
        error: `只能设置为：${["true", "false"].join("、")} 的一种`,
        description: "publish 时是否发布至 npm",
    },
};
