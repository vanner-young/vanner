import { PjPkg } from "@core/module/pjPkj";
import { execProjectCommandInCwd } from "@vanner/common";

export class Run {
    async verify() {
        const cwd = await PjPkg.getCwd(); // 获取当前执行路径
        const cli = await PjPkg.getPkg(cwd); // 获取包管理器
        return { cwd, cli };
    }

    async start(command: string, args: Array<string>) {
        const { cwd, cli } = await this.verify();
        const commandArgs = [command, ...args];
        const fullCommand = commandArgs.join(" ");

        const emptyPkgs = !commandArgs.find(
            (it) => it?.trim() && !it.startsWith("-")
        );
        if (emptyPkgs) throw new Error("命令中请提供需要运行的项目命令");

        await execProjectCommandInCwd(cli, cwd, fullCommand).catch((e) => {
            throw new Error("执行项目命令失败：\n" + (e.message || e));
        });
    }
}
