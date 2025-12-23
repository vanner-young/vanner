import { Packages } from "@vanner/module";
import { PjPkg } from "@core/module/pjPkj";

export class DelPackage {
    async verify() {
        const cwd = await PjPkg.getCwd(); // 获取当前执行路径
        const cli = await PjPkg.getPkg(cwd); // 获取包管理器
        return { cwd, cli };
    }

    async start(packages: Array<string>) {
        packages = Array.from(new Set([...packages]));
        const { cwd, cli } = await this.verify();

        const emptyPkgs = !packages.find(
            (it) => it?.trim() && !it.startsWith("-")
        );
        if (emptyPkgs) throw new Error("命令中请提供需要卸载的包");

        new Packages({
            cwd: cwd,
            toolCli: cli,
            packages: packages,
        }).action("uninstall");
    }
}
