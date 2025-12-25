import * as path from "node:path";
import { existsSync } from "node:fs";
import { package_manger_view } from "@core/constance";
import { execCommand } from "mv-common/pkg/node/m.process";
import { findParentFile } from "mv-common/pkg/node/m.file";

/**
 * 设置运行时所需的程序配置
 * @param { string | Array<{ key: string; value: string }> } key 配置项key
 * @param { string } value 配置项value
 * **/
export const setRuntimeConfig = (
    key: string | Array<{ key: string; value: string }>,
    value?: string
) => {
    if (Array.isArray(key)) {
        for (const item of key) {
            const envKey = `${
                process.env.APP_NAME
            }_${item.key.toLocaleLowerCase()}`;
            process.env[envKey] = item.value;
        }
    } else {
        const envKey = `${process.env.APP_NAME}_${key.toLocaleLowerCase()}`;
        process.env[envKey] = value;
    }
};

/**
 * 获取运行时所需的程序配置
 * @param { string | Array<string> } key 配置项key
 * **/
export const getRuntimeConfig = (key: string | Array<string>) => {
    if (Array.isArray(key)) {
        return key.reduce((pre, next) => {
            pre[next] =
                process.env[
                    `${process.env.APP_NAME}_${next.toLocaleLowerCase()}`
                ];
            return pre;
        }, {} as Record<string, string | undefined>);
    }
    return process.env[`${process.env.APP_NAME}_${key.toLocaleLowerCase()}`];
};

/**
 * 设置运行时标志
 * @param { "bun" | "node" } cli 运行时
 * **/
export enum RuntimeFlag {
    cli = "RUNTIME_CLI",
    git = "RUNTIME_GIT",
}
export const setRuntimeFlag = (key: RuntimeFlag, value: string) => {
    setRuntimeConfig(key, value);
};

/**
 * 获取运行时标志
 * **/
export const getRuntimeFlag = (key: RuntimeFlag) => {
    return getRuntimeConfig(key);
};

/**
 * 获取当前项目的包版本管理器, 目前支持 yarn|npm|pnpm|bun
 * @param { string } targetPath 目标路径
 * **/
export const getPackageMangerName = (
    targetPath: string = process.cwd()
): string | void => {
    for (const key in package_manger_view) {
        const value =
            package_manger_view[key as keyof typeof package_manger_view];
        if (existsSync(path.resolve(targetPath, value))) {
            return key;
        }
    }
};

/**
 * 在某个项目路径下执行一条项目命令
 * @param { string } cli 包管理器名称
 * @param { string } cwd 目标路径
 * @param { string } command 需要执行的命令
 * **/
export const execProjectCommandInCwd = async (
    cli: string,
    cwd: string,
    command: string
) => {
    const runStr = ["bun", "npm"].includes(cli) ? "run" : "";

    command = `${cli} ${runStr}${runStr ? " " : ""}${command}`;
    await execCommand(command, {
        stdio: "inherit",
        cwd,
    });
};

/**
 * 基于当前的地址向上查询git的可执行目录
 * **/
export const searchCwdPath = async (filename: string) => {
    const cwd = await findParentFile(process.cwd(), filename);
    if (!cwd) throw new Error("当前目录及父级目录不是一个可执行目录！");
    return cwd;
};
