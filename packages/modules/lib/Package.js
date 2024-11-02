const axios = require("axios");
const { basicCommon, platform } = require("@mvanner/common");

class Package {
    execCwd = process.cwd();
    packageCli = "";
    #packageConfig = {
        packageList: [],
        registry: null,
    };
    constructor({ packageList, registry }) {
        this.#packageConfig.packageList = packageList;
        this.#packageConfig.registry = registry;
    }
    async getPackageMangerCliName() {
        try {
            const pnpmDependencies = await basicCommon.getExecCommandResult(
                "pnpm list -r",
                { cwd: this.execCwd },
            );
            if (pnpmDependencies.trim()) this.packageCli = "pnpm";
            else throw new Error("");
        } catch (e) {
            this.packageCli = platform.getPackageCli(this.execCwd);
        }
        if (!this.packageCli)
            throw new Error(
                "缺少包管理工具(npm | yarn | pnpm)，请检查包管理工具后重试",
            );
    }
    async invalidProject(cb) {
        this.execCwd = await platform.findProjectParentExecCwd(this.execCwd);
        if (!this.execCwd) throw new Error("当前及父级目录下不是一个项目目录");
        await this.getPackageMangerCliName();

        if (this.#packageConfig.registry) {
            const validUrl = basicCommon.isValidUrl(
                this.#packageConfig.registry,
            );
            if (!validUrl) {
                console.log("当前默认的registry链接格式无效，已重置");
                this.#packageConfig.registry = null;
            }
        }
        cb();
    }
    async confirmRegistry() {
        try {
            const result = await basicCommon.getExecCommandResult(
                `${this.packageCli} config get registry`,
                { cwd: this.execCwd },
            );
            if (basicCommon.isValidUrl(result)) {
                const response = await axios.get(result, {
                    timeout: Number(
                        platform.getProcessEnv("request_timeout") || 3000,
                    ),
                });
                if (response.status === 200) return result;
            }
            throw new Error("");
        } catch (e) {
            return this.#packageConfig.registry;
        }
    }
    async initInstall() {
        const registry = await this.confirmRegistry();
        basicCommon.execCommandPro(
            `${this.packageCli} install ${registry ? `--registry ${registry}` : ""}`,
            { cwd: this.execCwd, stdio: "inherit" },
        );
    }
    async installPackageName(packageList) {
        const registry = await this.confirmRegistry();
        const installStr =
            this.packageCli === "yarn"
                ? "yarn add"
                : `${this.packageCli} install`;

        basicCommon.execCommandPro(
            `${installStr} ${packageList} ${registry ? `--registry ${registry}` : ""} ${this.packageCli?.toLocaleLowerCase?.() === "pnpm" ? "-w" : ""}`,
            { cwd: this.execCwd, stdio: "inherit" },
        );
    }
    install() {
        this.invalidProject(() => {
            if (!this.#packageConfig.packageList.length) this.initInstall();
            else
                this.installPackageName(
                    this.#packageConfig.packageList.join(" "),
                );
        });
    }
}

module.exports = Package;
