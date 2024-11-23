const fs = require("fs");
const path = require("path");
const Inquirer = require("@vanner/inquirer");
const { filterEmptyArray, basicCommon } = require("@vanner/common");
const { chooseRunCommand } = require("../constance/question");

class Run extends Inquirer {
    #config = {
        env: {},
        cwd: process.cwd(),
        command: null,
    };
    async start(command, option) {
        await this.parseCommand(command);
        this.parseEnv(option);
        return this.exec();
    }
    exec() {
        const { command, cwd } = this.#config;
        if (!command || !cwd) return;
        return basicCommon.execCommand(this.#config.command, {
            stdio: "inherit",
            cwd,
            env: {
                ...process.env,
                Path: `${path.resolve(cwd, "node_modules/.bin")};${process.env.Path}`,
            },
        });
    }
    async parseCommand(command) {
        this.#config.cwd = await basicCommon.findParentFile(
            this.#config.cwd,
            "package.json",
        );
        if (!this.#config.cwd)
            throw new Error(
                "当前目录及其父级目录不是一个前端项目，请更换路径后重试",
            );
        const scripts = JSON.parse(
            fs.readFileSync(path.resolve(this.#config.cwd, "package.json")),
            "{}",
        ).scripts;

        const commandList = Object.keys(scripts);
        if (!commandList.length)
            throw new Error("当前项目下，无运行的命令，请检查后重试");
        if (!commandList.includes(command))
            this.#config.command = await this.handler(
                chooseRunCommand(
                    command,
                    Object.entries(scripts).map(([key, value]) => ({
                        name: `${key}  ${value}`,
                        value: value,
                    })),
                ),
            );
        else this.#config.command = scripts[command];
    }
    parseEnv({ env = [] }) {
        env = filterEmptyArray(env);
        if (env.length) {
            for (const item of env) {
                const [key, value] = item.split("=");
                this.#config.env[key] = value;
            }
        }
    }
}

module.exports = new Run();
