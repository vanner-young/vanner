import { getRuntimeConfig } from "@vanner/common";

import { Config } from "@core/command/config";
import { AddPackage } from "@core/command/add";
import { DelPackage } from "@/packages/core/src/command/del";
import { Run } from "@core/command/run";
import { ExecFile } from "@core/command/ex";
import { Push } from "@core/command/push";
import { Commit } from "@core/command/commit";
import { Reset } from "@core/command/reset";

/**
 * 命令注册配置选项
 * **/
export const registerCommandOption = () => {
    return [
        {
            command: "config",
            description: "管理命令行工作的配置信息",
            children: [
                {
                    command: "list",
                    description: "获取命令行配置列表",
                    action: (...rest: Array<unknown>) => {
                        new Config().start("list", ...rest);
                    },
                },
                {
                    command: "get <key>",
                    description: "获取命令行的配置信息",
                    action: (...rest: Array<unknown>) => {
                        new Config().start("get", ...rest);
                    },
                },
                {
                    command: "set <key> [value]",
                    description: "设置命令行的配置信息",
                    action: (...rest: Array<unknown>) => {
                        new Config().start("set", ...rest);
                    },
                },
                {
                    command: "del <key>",
                    description: "删除命令行配置信息",
                    action: (...rest: Array<unknown>) => {
                        new Config().start("delete", ...rest);
                    },
                },
                {
                    command: "reset",
                    description: "重置命令行配置信息",
                    action: () => {
                        new Config().resetConfig();
                    },
                },
            ],
        },
        {
            command: "add [package@version...]",
            description: "在本地项目中安装一个或多个依赖包",
            allowUnknownOption: true,
            action: (packages: Array<string>) => {
                new AddPackage().start(packages);
            },
        },
        {
            command: "del [package@version...]",
            description: "在本地项目中删除一个或多个依赖包",
            allowUnknownOption: true,
            action: (packages: Array<string>) => {
                new DelPackage().start(packages);
            },
        },
        {
            command: "run <command> [args...]",
            allowUnknownOption: true,
            description: "在本地项目中运行一个项目命令",
            action: (command: string, args: Array<string>) => {
                new Run().start(command, args);
            },
        },
        {
            command: "ex <filename> [args...]",
            allowUnknownOption: true,
            description:
                "在当前的目录下使用(node/bun)执行一个文件（支持 .js/.ts/.html 文件）",
            action: (file: string, args: Array<string>) => {
                new ExecFile().start(file, args);
            },
        },
        {
            command: "push",
            description: "将本地代码提交至远程仓库",
            option: [
                {
                    command: "-t --tag",
                    description:
                        "推送时，是否添加tag(取package.json中的version字段)",
                },
            ],
            action: (option: { tag: boolean }) => {
                new Push().start(option);
            },
        },
        {
            command: "commit",
            description: "将代码提交至本地工作区",
            option: [
                {
                    command: "-a --amend",
                    description: "修改最近一次本地工作区的提交描述",
                },
            ],
            action: (option: { amend: boolean }) => {
                new Commit().start(option);
            },
        },
        {
            command: "reset",
            description: "还原暂存区或已提交至本地的代码",
            option: [
                {
                    command: "-c --commit",
                    description: "是否将最近一次提交至本地的代码回退暂存区",
                },
            ],
            action: (option: { commit: boolean }) => {
                new Reset().start(option);
            },
        },
        {
            usage: process.env.APP_NAME,
            version: getRuntimeConfig("app_version"),
            option: [{ command: "-v", hideHelp: true }],
            description: getRuntimeConfig("app_description"),
        },
    ];
};
