import { extname } from "node:path";

import { support_exec_file } from "@core/constance";
import { execCommand } from "mv-common/pkg/node/m.process";
import { getRuntimeFlag, RuntimeFlag } from "@vanner/common";

export class ExecFile {
    /**
     * 确定需要执行文件的解释器（当运行js使用node，反之使用bun）
     * @param { string } suffix 文件后缀
     * **/
    public async getRuntimeCli(suffix: string) {
        let cli = getRuntimeFlag(RuntimeFlag.cli);
        if (!cli) {
            if (suffix === ".js") return "node";
            else return "bun";
        }

        if (cli === "node" && suffix !== ".js") {
            throw new Error(
                "直接运行js文件时，推荐使用bun工具，安装文档：https://bun.com/docs/installation"
            );
        }

        return cli;
    }

    public async verifyFileName(suffix: string) {
        if (!suffix) {
            throw new Error(
                "命令输入错误或无法识别需要执行的文件类型，请确认命令输入或文件名称是否正确"
            );
        }

        if (!support_exec_file.includes(suffix)) {
            throw new Error(
                `当前文件不支持被执行，仅支持 "${support_exec_file.join(
                    "/"
                )}" 文件`
            );
        }
    }

    /**
     * 在某个路径下在运行一个文件
     * @param { string } cli 运行时
     * @param { string } command 需要执行的命令
     * **/
    public async runFileInCwd(cli: string, command: string) {
        const runStr = ["bun"].includes(cli) ? "run" : "";

        command = `${cli} ${runStr}${runStr ? " " : ""}${command}`;
        await execCommand(command, {
            cwd: process.cwd(),
            stdio: "inherit",
        });
    }

    public async start(filename: string, args: Array<string>) {
        const suffix = extname(filename);

        await this.verifyFileName(suffix);
        const runtimeCli = (await this.getRuntimeCli(suffix)) as "bun" | "node";

        await this.runFileInCwd(runtimeCli, [filename, ...args].join(" "));
    }
}
