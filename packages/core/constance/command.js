const commandConfig = () => [
    {
        command: "config",
        description: "管理脚手架的配置信息",
        children: [
            {
                command: "get <key>",
                description: "获取脚手架的配置信息",
                action: (...rest) => {
                    require("../command/config").start("get", ...rest);
                },
            },
            {
                command: "set <key> [value]",
                description: "设置脚手架的配置信息",
                action: (...rest) => {
                    require("../command/config").start("set", ...rest);
                },
            },
            {
                command: "list",
                description: "获取脚手架配置列表",
                action: (...rest) => {
                    require("../command/config").start("list", ...rest);
                },
            },
        ],
    },
    {
        command: "run [args...]",
        description: "可在当前目录或指定的目录下执行一条命令",
        option: [
            {
                command: "-d, --dir <path>",
                description: "设置这条命令或执行文件的工作地址",
            },
            {
                command: "-f, --file",
                description: "当值存在时，将采用Node执行一个JavaScript 文件",
            },
        ],
        action: require("../command/run"),
    },
    {
        command: "init",
        description: "根据脚手架的指示初始化一个前端项目",
        action: require("../command/initProject"),
    },
    {
        command: "template",
        description: "管理脚手架自定义项目模板",
        children: [
            {
                command: "list",
                description: "获取自定义项目模板列表",
                action: (...rest) =>
                    require("../command/mangerTemplate").start("list", ...rest),
            },
            {
                command: "add <projectName>",
                description: "添加一个自定义项目模板",
                action: (...rest) =>
                    require("../command/mangerTemplate").start("add", ...rest),
            },
            {
                command: "delete [projectName...]",
                description: "删除一个或全部的自定义项目模板",
                option: [
                    {
                        command: "--all",
                        description: "删除全部的自定义项目模板",
                    },
                ],
                action: (...rest) =>
                    require("../command/mangerTemplate").start(
                        "delete",
                        ...rest,
                    ),
            },
            {
                command: "update [projectName...]",
                description: "更新一个或全部的自定义项目模板",
                option: [
                    {
                        command: "--all",
                        description: "更新全部的自定义项目模板",
                    },
                ],
                action: (...rest) =>
                    require("../command/mangerTemplate").start(
                        "update",
                        ...rest,
                    ),
            },
        ],
    },
    {
        command: "create [projectName]",
        description: "基于自定义项目模板创建一个项目",
        action: require("../command/create"),
    },
];

module.exports = commandConfig;
