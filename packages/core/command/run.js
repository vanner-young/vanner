const fs = require("fs");
const path = require("path");
const { Inquirer } = require("@mv-cli/modules");
const { filterEmptyArray, fileAction, basicCommon } = require("@mv-cli/common");
const { chooseRunCommand } = require("../constance/question");

class Run extends Inquirer {
    #config = {
        cwd: false,
        env: {},
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
        return basicCommon.execCommandPro(this.#config.command, {
            stdio: "inherit",
            cwd,
            env: {
                ...process.env,
                Path: `${path.resolve(cwd, "node_modules/.bin")};${process.env.Path}`,
            },
        });
    }
    async parseCommand(command) {
        if (!this.#config.cwd) {
            this.#config.cwd = process.cwd();
            this.loadCwd();
        }
        const { scripts } = require(
            path.resolve(this.#config.cwd, "package.json"),
        );
        const commandList = Object.keys(scripts);

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
    loadCwd() {
        const cwdPath = this.findProjectPath(this.#config.cwd);
        if (!cwdPath)
            throw new Error("执行失败, 此路径及其父级均不存在可执行的项目");
        this.#config.cwd = cwdPath;
    }
    findProjectPath(targetPath) {
        if (fileAction.isDrivePath(targetPath)) return false;
        const packageJsonDir = path.resolve(targetPath, "package.json");
        if (!fs.existsSync(packageJsonDir)) {
            return this.findProjectPath(path.dirname(targetPath));
        } else {
            return targetPath;
        }
    }
}

module.exports = new Run();
