const { basicCommon, platform } = require("@vanner/common");

class Package {
    execCwd = process.cwd();
    packageCli = "";
    type = "install";
    #packageConfig = {
        cwd: process.cwd(),
        packageList: [],
        registry: null,
        packageCli: null,
        type: { D: false },
    };
    constructor({ packageList, registry, cwd, packageCli, type }) {
        this.#packageConfig.cwd = cwd;
        this.#packageConfig.registry = registry;
        this.#packageConfig.packageCli = packageCli;
        this.#packageConfig.packageList = packageList;
        this.#packageConfig.type = {
            ...this.#packageConfig.type,
            ...type,
        };
    }
    async invalidProject(cb) {
        const { cwd, packageCli } = this.#packageConfig;
        if (!cwd || !packageCli)
            throw new Error("当前目录不是一个有效项目，请检查后重试");

        if (!platform.verifyPackageCliName(packageCli))
            throw new Error(
                `包管理器无效, 仅支持${basicCommon.packageMangerViewer.keys().toArray().join("、")}, 当前使用的为:${packageCli}`,
            );

        if (this.#packageConfig.registry) {
            if (!basicCommon.isValidUrl(this.#packageConfig.registry)) {
                console.log("当前默认的registry链接格式无效，已重置");
                this.#packageConfig.registry = null;
            }
        }
        cb();
    }
    parserInstallType() {
        const { D } = this.#packageConfig.type;
        return D ? "-D" : "";
    }
    async confirmRegistry() {
        const result = await basicCommon.execCommand(
            `${this.#packageConfig.packageCli} config get registry`,
            { cwd: this.#packageConfig.cwd },
        );
        const isResponse = await platform.responseUrl(result.trim(), {
            timeout: Number(platform.getProcessEnv("request_timeout")) || 1000,
        });
        if (isResponse) return result;

        console.log(
            `registry is timeout... checkout npm mirror：${this.#packageConfig.registry}...`,
        );
        return this.#packageConfig.registry;
    }
    async initAction() {
        const registry = await this.confirmRegistry();
        platform.installDependencies(
            this.#packageConfig.packageCli,
            this.#packageConfig.cwd,
            [],
            registry,
        );
    }
    async packageNameAction(packageList) {
        if (!packageList.length)
            throw new Error("包名称不可为空, 请输入后重试");
        const registry = await this.confirmRegistry();
        const handler =
            this.type === "install"
                ? platform.installDependencies
                : platform.uninstallDependencies;
        const installTypeStr = this.parserInstallType();
        handler(
            this.#packageConfig.packageCli,
            this.#packageConfig.cwd,
            packageList || [],
            registry,
            installTypeStr,
        );
    }
    action(type) {
        if (type) this.type = type;
        this.invalidProject(() => {
            const isInitInstall =
                !this.#packageConfig.packageList.length &&
                this.type === "install";
            if (isInitInstall) {
                return this.initAction();
            } else {
                this.packageNameAction(this.#packageConfig.packageList);
            }
        });
    }
}

module.exports = Package;
