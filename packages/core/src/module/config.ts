import { Config as ConfigModule, Inquirer } from "@vanner/module";
import { qsForResetConfig } from "@core/constance/quetion";
import { config_default_option } from "@core/constance";
import { config_tool_file_path } from "@core/constance";
import type { IndexType } from "mv-common/pkg/type";

export class Config extends ConfigModule {
    #inquirer;
    constructor() {
        super({
            sourcePath: config_tool_file_path(),
            defaultContent: Object.keys(config_default_option).reduce(
                (config: IndexType<unknown>, key: string) => {
                    config[key] =
                        config_default_option[
                            key as keyof typeof config_default_option
                        ].value;
                    return config;
                },
                {} as IndexType<unknown>
            ),
        });
        this.#inquirer = new Inquirer();
    }
    async invalidSetContent(
        key: keyof typeof config_default_option,
        value: string
    ) {
        const keys = Object.keys(config_default_option);
        if (!keys.includes(key)) return;

        const keyItem = config_default_option[key];
        if ("require" in keyItem) {
            const valid = keyItem.require(value);
            if (!valid) throw new Error(keyItem?.error || "值设置异常");
        }
    }
    outputList() {
        const stringifyData = this.stringify().split("\n");
        for (const config of stringifyData) {
            const key: string = config.slice(0, config.indexOf(" "));
            if (key in config_default_option) {
                console.log(
                    `${config.replace("\r", "")} 【${
                        config_default_option[
                            key as keyof typeof config_default_option
                        ]["description"]
                    }】`
                );
            }
        }
    }
    getConfigResult(key: string) {
        if (!this.has(key)) return;
        return this.get(key);
    }
    getConfig(key: string) {
        if (!this.has(key)) throw new Error(`${key} 不存在此配置`);
        console.log(this.get(key));
    }
    setConfig(key: string, value: string) {
        if (key.includes("=")) {
            [key, value] = key.split("=") as [string, string];
        }
        this.invalidSetContent(
            key as keyof typeof config_default_option,
            value
        ).then(() => {
            this.set(key, value);
        });
    }
    deleteConfig(key: string) {
        if (Object.keys(config_default_option).includes(key)) {
            throw new Error("当前Key为系统固定预设值，无法删除");
        }
        this.delete(key);
    }
    async resetConfig() {
        const resetConfig = await this.#inquirer.handler(qsForResetConfig());
        if (!resetConfig) return;
        this.reset();

        this.outputList();
    }
}
