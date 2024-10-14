const { getProcessEnv } = require("@mv-cli/common/lib/platform");

const Config = require("../command/config");
const Run = require("../command/run");
const Init = require("../command/init");
const Template = require("../command/template");
const Create = require("../command/create");
const Install = require("../command/install");
const Commit = require("../command/commit");

const commandConfig = () => {
    const {
        app_version: version,
        app_name: name,
        app_des: description,
    } = getProcessEnv(["app_version", "app_name", "app_des"]);

    return [
        {
            usage: name,
            version: version,
            option: [{ command: "-v", hideHelp: true }],
            description: description,
        },
        {
            command: "config",
            description: "管理脚手架的配置信息",
            children: [
                {
                    command: "list",
                    description: "获取脚手架配置列表",
                    action: (...rest) => {
                        Config.start("list", ...rest);
                    },
                },
                {
                    command: "get <key>",
                    description: "获取脚手架的配置信息",
                    action: (...rest) => {
                        Config.start("get", ...rest);
                    },
                },
                {
                    command: "set <key> [value]",
                    description: "设置脚手架的配置信息",
                    action: (...rest) => {
                        Config.start("set", ...rest);
                    },
                },
                {
                    command: "delete <key>",
                    description: "删除脚手架配置信息",
                    action: (...rest) => {
                        Config.start("delete", ...rest);
                    },
                },
                {
                    command: "reset",
                    description: "重置脚手架配置信息",
                    action: () => {
                        Config.resetConfig();
                    },
                },
            ],
        },
        {
            command: "run [filename...]",
            description: "可在当前目录或指定的目录下执行一条命令",
            option: [
                {
                    command: "-d, --dir <path>",
                    description: "设置这条命令或执行文件的工作地址",
                },
                {
                    command: "-f, --file",
                    description:
                        "当值存在时，将采用Node执行一个JavaScript 文件",
                },
            ],
            action: Run,
        },
        {
            command: "init",
            description: "根据脚手架的指示初始化一个前端项目",
            action: Init,
        },
        {
            command: "template",
            description: "管理脚手架自定义项目模板",
            children: [
                {
                    command: "list",
                    description: "获取自定义项目模板列表",
                    action: (...rest) => Template.start("list", ...rest),
                },
                {
                    command: "add <projectName>",
                    description: "添加一个自定义项目模板",
                    action: (...rest) => Template.start("add", ...rest),
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
                    action: (...rest) => Template.start("delete", ...rest),
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
                    action: (...rest) => Template.start("update", ...rest),
                },
            ],
        },
        {
            command: "create <projectName>",
            option: [
                {
                    command: "-t, --template <template>",
                    description: "系统中的模板名称",
                },
            ],
            description: "基于自定义项目模板创建一个项目",
            action: Create,
        },
        {
            command: "install [package@version...]",
            description: "安装一个Npm包",
            option: [
                {
                    command: "--cli [name]",
                    description: "使用的包管理器名称",
                },
            ],
            action: Install,
        },
        {
            command: "commit",
            description: "提交Git代码",
            option: [
                {
                    command: "-t, --type <type>",
                    description: "提交类型：feat|fix等",
                },
                {
                    command: "-m, --message <message>",
                    description: "本次提交的消息内容",
                },
                {
                    command: "-f, --file <filename...>",
                    description: "本次提交的文件",
                },
                {
                    command: "-b, --branch <branch>",
                    description: "提交到Git分支的名称",
                },
                {
                    command: "-o, --origin <origin>",
                    description: "提交的远程源名称",
                },
            ],
            action: Commit,
        },
    ];
};

module.exports = commandConfig;
