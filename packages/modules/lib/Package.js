const { basicCommon, platform } = require("@mv-cli/common");

class Package {
    #packageConfig = {
        packageList: [],
        registry: null,
    };
    constructor({ packageList, registry }) {
        this.#packageConfig.packageList = packageList;
        this.#packageConfig.registry = registry;
    }
    get packageCli() {
        return platform.getPackageCli();
    }
    invalidProject(cb) {
        const initEnv = platform.invalidProjectInstallEnv(process.cwd());
        if (!initEnv) throw new Error("当前还未初始化环境，请初始化后重试!");
        if (!this.packageCli)
            throw new Error(
                "缺少包管理工具(npm | yarn | pnpm)，请检查包管理工具后重试",
            );
        if (this.#packageConfig.registry) {
            const validUrl = basicCommon.isValidUrl(
                this.#packageConfig.registry,
            );
            if (!validUrl) {
                console.log("当前registry链接格式无效，已重置");
                this.#packageConfig.registry = null;
            }
        }
        cb();
    }
    initInstall() {
        const { registry } = this.#packageConfig;
        basicCommon.execCommand(
            `${this.packageCli} install`,
            registry && `--registry ${registry}`,
        );
    }
    installPackageName(packageList) {
        const { registry } = this.#packageConfig;
        const installStr =
            this.packageCli === "yarn"
                ? "yarn add"
                : `${this.packageCli} install`;

        basicCommon.execCommand(
            installStr,
            packageList,
            registry && `--registry ${registry}`,
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
