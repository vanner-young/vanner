const { Config } = require("@mv-cli/modules");
const { getProcessEnv } = require("@mv-cli/common/lib/platform");

class ConfigCli extends Config {
    constructor() {
        const appSourceFilePath = getProcessEnv("app_source_file_path");
        super({
            source: appSourceFilePath,
            encoding: "utf-8",
        });
    }
    /**
     * 查看或获取当前脚手架的配置信息
     * **/
    start(type, ...rest) {
        this.load();
        const typeHandler = new Map([
            ["get", this.getConfig],
            ["set", this.setConfig],
            ["list", this.outputList],
        ]);
        if (typeHandler.has(type)) typeHandler.get(type).call(this, ...rest);
    }
    outputList() {
        return console.log(this.stringify());
    }
    getConfig(key) {
        const value = this.get(key);
        if (!value) return console.log(`${key} 不存在此配置`);
        console.log(value);
    }
    setConfig(key, value) {
        this.set(key, value);
    }
}

module.exports = new ConfigCli();
