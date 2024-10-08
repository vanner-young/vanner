const { Command, Option } = require("commander");

const { basicCommon, platform } = require("@mv-cli/common");
const { getProcessEnv } = require("@mv-cli/common/lib/platform");
const { RegisterCommand: RegisterCommandUtil } = require("@mv-cli/modules");

class RegisterCommand {
    #program;
    #registerCommandUtil;
    execCommandList = {
        run: require("./run"),
        config: require("./config"),
        initCommand: require("./initProject"),
        createProject: require("./create"),
        mangerTemplate: require("./mangerTemplate"),
    };
    register(program) {
        this.#program = program;
        this.#registerCommandUtil = new RegisterCommandUtil({
            commandOption: require("../constance/command"),
            program: this.#program,
        });
        this.#registerCommandUtil.registerAll();

        // this.registerConfig(); // 注册脚手架配置信息指令
        // this.registryExecCommand(); // 注册执行命令
        // this.registerInitProject(); // 注册脚手架初始化项目指令
        // this.registerMangerTemplate(); // 注册管理项目模板的指令
        // this.registerCreateProject(); // 注册创建模板的项目指令
        this.#program.on("command:*", () => this.#program.outputHelp());
    }
    execCommand(key, ...option) {
        if (!this.execCommandList[key]) return;
        this.execCommandList[key].start(...option);
    }
    registerConfig() {
        const registerConfig = () => {
            const config = new Command("config").description(
                "管理脚手架的配置信息",
            );
            config
                .command("get <key>")
                .description("获取脚手架的配置信息")
                .action((...rest) => {
                    this.execCommand("config", "get", ...rest);
                });
            config
                .command("set <key> [value]")
                .description("设置脚手架的配置信息")
                .action((...rest) => {
                    this.execCommand("config", "set", ...rest);
                });
            config
                .command("list")
                .description("获取脚手架配置列表")
                .action(() => {
                    this.execCommand("config", "list");
                });
            return config;
        };
        this.#program.addCommand(registerConfig());
    }
    registerInitProject() {
        this.#program
            .command("init")
            .description("根据脚手架的指示初始化一个前端项目")
            .action(() => this.execCommand("initCommand"));
    }
    registryExecCommand() {
        this.#program
            .command("run [args...]")
            .addOption(
                new Option(
                    "-d, --dir <path>",
                    "设置这条命令或执行文件的工作地址",
                ),
            )
            .addOption(
                new Option(
                    "-f, --file",
                    "当值存在时，将采用Node执行一个JavaScript 文件",
                ),
            )
            .description("可在当前目录或指定的目录下执行一条命令")
            .action((...rest) => {
                this.execCommand("run", ...rest);
            });
    }
    registerCreateProject() {
        this.#program
            .command("create [projectName]")
            .description("基于自定义项目模板创建一个项目")
            .action((...rest) => {
                this.execCommand("createProject", ...rest);
            });
    }
    registerMangerTemplate() {
        const registryTemplate = () => {
            const template = new Command("template").description(
                "管理脚手架自定义项目模板",
            );
            template
                .command("list")
                .description("获取自定义项目模板列表")
                .action(() => {
                    this.execCommand("mangerTemplate", "list");
                });

            template
                .command("add <projectName>")
                .description("添加一个自定义项目模板")
                .action((...rest) => {
                    this.execCommand("mangerTemplate", "add", ...rest);
                });

            template
                .command("delete [projectName...]")
                .addOption(new Option("--all", "删除全部的自定义项目模板"))
                .description("删除一个或全部的自定义项目模板")
                .action((...rest) => {
                    this.execCommand("mangerTemplate", "delete", ...rest);
                });

            template
                .command("update [projectName...]")
                .addOption(new Option("--all", "更新全部的自定义项目模板"))
                .description("更新一个或全部的自定义项目模板")
                .action((...rest) => {
                    this.execCommand("mangerTemplate", "update", ...rest);
                });

            return template;
        };

        this.#program.addCommand(registryTemplate());
    }
}

class BaseCommand extends RegisterCommand {
    start() {
        this.program = new Command();
        this.initBasicCli();
    }
    initBasicCli() {
        const { app_version: version, app_name: name } = getProcessEnv([
            "app_version",
            "app_name",
        ]);

        // 扩展默认自带参数
        this.program
            .usage(name)
            .version(version)
            .addOption(new Option("-v").hideHelp())
            .description("a express for web or node cli");

        // 全局指令指令兜底
        this.program.action((source, dest) => {
            if (basicCommon.isEmptyObject(source) && dest.args.length < 1) {
                this.program.outputHelp();
            } else if (source.v) {
                console.log(platform.getProcessEnv("app_version"));
            } else {
                console.log("无效的指令:", dest.args.join("、"));
            }
        });

        // 注册命令
        this.register(this.program);

        // 解析传递的参数
        this.program.parse(process.argv);
    }
}

const mvBasicCommand = new BaseCommand();
module.exports = mvBasicCommand;
