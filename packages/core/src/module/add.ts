import { Config } from "@core/module/config";
import { findParentFile } from "mv-common/pkg/node/m.file";

import { Packages } from "@vanner/module";
import { getPackageMangerName } from "@vanner/common";

export class AddPackage {
    #config: Config;

    constructor() {
        this.#config = new Config();
    }

    async start(packages: Array<string>) {
        packages = Array.from(new Set([...packages]));
        const cwd = await findParentFile(process.cwd(), "package.json");
        if (!cwd) throw new Error("当前目录及父级目录不是一个可执行目录！");

        const cli = getPackageMangerName(cwd);
        if (!cli) throw new Error("当前项目下不存在有效的包管理器！");

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
