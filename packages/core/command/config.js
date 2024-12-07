const Inquirer = require("@vanner/inquirer");
const ConfigModule = require("@vanner/config");
const { basicCommon, platform } = require("@vanner/common");
const { getProcessEnv } = require("@vanner/common/lib/platform");

const { defaultConfigModuleContent } = require("../constance");
const { resetConfigFile } = require("../constance/question");

class Config extends ConfigModule {
    #inquirer;
    constructor() {
        super({
            source: getProcessEnv("app_cache_config_path"),
            encoding: "utf-8",
            defaultContent: defaultConfigModuleContent,
        });
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
        if (Object.keys(defaultConfigModuleContent).includes(key) && !value) {
            return console.log("当前Key为系统固定预设值，必须设定一个值");
        }
        if (key === "default_registry") {
            if (!basicCommon.isValidUrl(value))
                return console.log("设置无效，必须是一个有效的http|https链接");
        } else if (key === "default_package_cli") {
            if (!platform.verifyPackageCliName(value))
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
    getConfigResult(key) {
        if (!this.has(key)) return;
        return this.get(key);
    }
    getConfig(key) {
        if (!this.has(key)) return console.log(`${key} 不存在此配置`);
        console.log(this.get(key));
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
        if (Object.keys(defaultConfigModuleContent).includes(key)) {
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
