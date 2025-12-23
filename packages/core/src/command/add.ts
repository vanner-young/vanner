import { Config } from "@core/command/config";

import { Packages } from "@vanner/module";
import { PjPkg } from "@core/module/pjPkj";

export class AddPackage {
    #config: Config;

    constructor() {
        this.#config = new Config();
    }

    async verify() {
        const cwd = await PjPkg.getCwd(); // 获取当前执行路径
        const cli = await PjPkg.getPkg(cwd); // 获取包管理器
        return { cwd, cli };
    }

    async start(packages: Array<string>) {
        packages = Array.from(new Set([...packages]));
        const { cwd, cli } = await this.verify();

        // 自行输入镜像权重大于配置镜像
        let mirror = this.#config.get("mirror_registry");
        let isMirrorAction = this.#config.get("install_use_mirror");
        if (packages.includes("--registry")) {
            const index = packages.indexOf("--registry");
            const newMirror = packages[index + 1];
            if (newMirror) {
                mirror = newMirror;
                isMirrorAction = true;
                packages.splice(index, 2);
            }
        }

        new Packages({
            packages,
            cwd: cwd,
            toolCli: cli,
            isMirrorAction,
            mirrorRegistry: mirror,
        }).action("install");
    }
}
