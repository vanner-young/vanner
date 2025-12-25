import { Packages } from "@vanner/module";
import { Dependencies } from "@core/module/dependencies";

export class AddPackage extends Dependencies {
    async start(packages: Array<string>) {
        packages = Array.from(new Set([...packages]));
        const globalAction = this.isGlobalAction(packages);

        if (globalAction && !this.hasDes(packages)) {
            throw new Error("命令中请提供需要安装的依赖~");
        }

        const { cwd, cli } = await this.confirmCwdAndCliInfo(globalAction);
        const { mirror, isMirrorAction } = await this.confirmMirror(packages);

        new Packages({
            packages,
            cwd: cwd,
            toolCli: cli,
            isMirrorAction,
            mirrorRegistry: mirror,
        }).action("install");
    }
}
