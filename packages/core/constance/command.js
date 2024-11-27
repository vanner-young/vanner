const { getProcessEnv } = require("@vanner/common/lib/platform");

const Config = require("../command/config");
const Exec = require("../command/exec");
const Init = require("../command/init");
const Template = require("../command/template");
const Create = require("../command/create");
const Install = require("../command/install");
const UnInstall = require("../command/uninstall");
const Push = require("../command/push");
const Run = require("../command/Run");
const Branch = require("../command/branch");

const commandConfig = () => {
    const {
        app_version: version,
        app_name: name,
        app_description: description,
    } = getProcessEnv(["app_version", "app_name", "app_description"]);

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
            command: "exec [filename...]",
            description:
                "可在当前目录或指定的目录下执行系统命令或JavaScript文件",
            option: [
                {
                    command: "-f, --file",
                    description:
                        "当值存在时, 将采用Node执行一个JavaScript 文件",
                },
                {
                    command: "-d, --dir <path>",
                    description:
                        "设置这条命令或执行文件的工作地址，默认为当前所在目录",
                },
            ],
            action: Exec,
        },
        {
            command: "run <command>",
            option: [
                {
                    command: "--env <args...>",
                    description: "执行命令的额外参数",
                },
            ],
            description: "运行当前项目下的项目命令",
            action: Run,
        },
        {
            command: "install [package@version...]",
            description: "安装一个Npm包",
            option: [
                {
                    command: "--cli [name]",
                    description: "使用的包管理器名称",
                },
                {
                    command: "--dir [path]",
                    description: "执行安装包时的命令工作目录",
                },
            ],
            action: Install,
        },
        {
            command: "uninstall <package@version...>",
            description: "删除一个已经安装的Npm包",
            option: [
                {
                    command: "--cli [name]",
                    description: "使用的包管理器名称",
                },
            ],
            action: UnInstall,
        },
        {
            command: "init [projectName]",
            description: "根据官方或自定义的模板初始化一个项目",
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
                    command: "add [gitRemote]",
                    description: "添加一个自定义项目模板",
                    action: (...rest) => Template.start("add", ...rest),
                },
                {
                    command: "del [projectName...]",
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
                    command: "upd [projectName...]",
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
            command: "push",
            description: "提交本地代码至Git仓库",
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
                {
                    command: "--onlyPush",
                    description: "直接将暂存区的代码推送至远程分支",
                },
            ],
            action: Push,
        },
        {
            command: "branch",
            description: "对项目分支进行管理",
            children: [
                {
                    command: "add [branchName]",
                    description: "新增一个分支",
                    action: (...rest) => Branch.start("add", ...rest),
                },
                {
                    command: "del [branchName...]",
                    description: "删除一个分支",
                    action: (...rest) => Branch.start("del", ...rest),
                },
                {
                    command: "list",
                    description: "查看分支列表",
                    action: (...rest) => Branch.start("list", ...rest),
                },
                {
                    command: "status",
                    description: "查看当前所在分支的变动文件",
                    action: (...rest) => Branch.start("status", ...rest),
                },
                {
                    command: "addOrigin [name] [address]",
                    description: "为当前项目添加一个Git源",
                    action: (...rest) => Branch.start("addOrigin", ...rest),
                },
                {
                    command: "delOrigin",
                    description: "在当前项目中，删除一个Git源",
                    action: (...rest) => Branch.start("delOrigin", ...rest),
                },
            ],
        },
    ];
};

module.exports = commandConfig;
