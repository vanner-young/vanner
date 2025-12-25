import { Packages } from "@vanner/module";
import { Dependencies } from "@core/module/dependencies";

export class DelPackage extends Dependencies {
    async start(packages: Array<string>) {
        packages = Array.from(new Set([...packages]));
        if (!this.hasDes(packages))
            throw new Error("命令中请提供需要卸载的依赖~");

        const globalAction = this.isGlobalAction(packages);
        const { cwd, cli } = await this.confirmCwdAndCliInfo(globalAction);

        new Packages({
            cwd: cwd,
            toolCli: cli,
            packages: packages,
        }).action("uninstall");
    }
}
