const { Config: ConfigModule, Inquirer } = require("@mvanner/modules");
const { getProcessEnv } = require("@mvanner/common/lib/platform");
const { resetConfigFile } = require("../constance/question");
const { basicCommon, platform } = require("@mvanner/common");

const defaultContent = {
    branch_secure: true,
    init_storage_pull: false,
    request_timeout: 3000,
    default_registry: "https://registry.npmmirror.com/",
    default_package_cli: "npm",
    default_commit_type: "fix",
    default_exec_file: "index.js",
};

class Config extends ConfigModule {
    #inquirer;
    constructor() {
        super({
            source: getProcessEnv("app_source_file_path"),
            encoding: "utf-8",
            defaultContent,
        });

        platform.setProcessEnv(
            Object.entries(Object.fromEntries(this.data)).map(
                ([key, value]) => ({
                    key,
                    value,
                }),
            ),
        );
        this.#inquirer = new Inquirer();
    }
    /**
     * 查看或获取当前脚手架的配置信息
     * **/
    start(type, ...rest) {
        const typeHandler = new Map([
            ["list", this.outputList],
            ["get", this.getConfig],
            ["set", this.setConfig],
            ["delete", this.deleteConfig],
        ]);
        if (typeHandler.has(type)) typeHandler.get(type).call(this, ...rest);
    }
    invalidSetContent(key, value, cb) {
        if (Object.keys(defaultContent).includes(key) && !value) {
            return console.log("当前Key为系统固定预设值，必须设定一个值");
        }
        if (key === "default_registry") {
            if (!basicCommon.isValidUrl(value))
                return console.log("设置无效，必须是一个有效的http|https链接");
        } else if (key === "default_package_cli") {
            if (!basicCommon.invalidPackageCli(value))
                return console.log(
                    `设置无效，值必须为:${Object.keys(Object.fromEntries(basicCommon.packageMangerViewer)).join("|")}`,
                );
        } else if (key.includes("init_storage_pull")) {
            const valueList = ["true", "false"];
            if (!valueList.includes(value)) {
                return console.log(
                    `设置无效，值必须为: ${valueList.join("|")}`,
                );
            }
        }
        cb();
    }
    outputList() {
        return console.log(this.stringify());
    }
    getConfig(key) {
        if (!this.has(key)) return console.log(`${key} 不存在此配置`);
        const val = this.get(key);
        return val;
    }
    setConfig(key, value) {
        if (key.includes("=")) {
            [key, value] = key.split("=");
        }
        this.invalidSetContent(key, value, () => {
            this.set(key, value);
        });
    }
    deleteConfig(key) {
        if (Object.keys(defaultContent).includes(key)) {
            return console.log("当前Key为系统固定预设值，无法删除");
        }
        this.delete(key);
    }
    async resetConfig() {
        const resetConfig = await this.#inquirer.handler(resetConfigFile());
        if (!resetConfig) return;
        this.reset();
    }
}

module.exports = new Config();
