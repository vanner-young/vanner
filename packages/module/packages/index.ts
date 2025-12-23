import { execCommand } from "mv-common/pkg/node/m.process";

export interface PackageProps {
    cwd: string;
    toolCli: string;
    packages: Array<string>;
    isMirrorAction?: boolean;
    mirrorRegistry?: string;
}

export type ExecType = "install" | "uninstall";

export class Packages {
    #type: ExecType = "install";
    #config = {
        cwd: process.cwd(), // 执行目录
        toolCli: "", // 包管理工具
        packages: [], // 需要安装的包
        mirrorRegistry: "", // 代理镜像
        isMirrorAction: false, // 安装包时，是否需要使用代理镜像
    };
    constructor(options: PackageProps) {
        Object.assign(this.#config, options);
    }

    /**
     * 在某个路径下执行依赖的安装
     * **/
    async installDependencies() {
        const { cwd, toolCli, packages, isMirrorAction, mirrorRegistry } =
            this.#config;

        const isAllInstall = !packages;
        const depCommand = isAllInstall ? "" : packages.join(" ");
        const mirrorCommand = isMirrorAction
            ? `--registry ${mirrorRegistry}`
            : "";
        const installCommand = ["pnpm", "yarn", "bun"].includes(toolCli)
            ? "add"
            : "install";

        const command = `${toolCli} ${
            isAllInstall ? "install" : `${installCommand} ${depCommand}`
        } ${mirrorCommand}`;
        await execCommand(command, {
            cwd,
            stdio: "inherit",
        });
    }

    /**
     * 在某个路径下执行依赖的删除
     * **/
    uninstallDependencies = async () => {
        const { cwd, packages, toolCli } = this.#config;

        const depCommand = packages.join(" ");
        const uninstallCommand = ["pnpm", "yarn", "bun"].includes(toolCli)
            ? "remove"
            : "uninstall";

        const command = `${toolCli} ${uninstallCommand} ${depCommand}`;
        await execCommand(command, {
            cwd,
            stdio: "inherit",
        });
    };

    async action(type: ExecType) {
        this.#type = type;
        if (this.#type === "install") {
            await this.installDependencies();
        } else {
            await this.uninstallDependencies();
        }
    }
}
