import { getRuntimeConfig } from "@vanner/common";
import { Config } from "@core/module/config";
import { AddPackage } from "@/packages/core/src/module/add";

/**
 * 命令注册配置选项
 * **/
export const registerCommandOption = () => {
    return [
        {
            command: "config",
            description: "管理命令行的配置",
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
            description: "安装一个Npm包",
            allowUnknownOption: true,
            action: (packages: Array<string>) => {
                new AddPackage().start(packages);
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
