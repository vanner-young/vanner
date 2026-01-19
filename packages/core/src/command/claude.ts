import { homedir } from "node:os";
import { resolve, dirname } from "node:path";

import { Config } from "@module/config";
import { Inquirer } from "@module/inquirer";
import { getRuntimeConfig, RuntimeFlag } from "@common/runtime";
import type { IndexType } from "mv-common/pkg/type";
import { exists, copyFile, createFile } from "mv-common/pkg/node/m.file";
import { config_claude_file_path } from "@core/constance/index";
import { claude_model } from "@core/constance/runtime";
import {
    qsForGeneralAsk,
    qsForChooseClaudeModel,
    qsForUsePreClaudeOption,
    qsForWriteClaudeOptionToCache,
} from "@core/constance/question";
import { executeInTerminal } from "@common/platform";

export class Claude extends Inquirer {
    #config: Config;

    constructor() {
        super();

        this.#config = new Config({
            sourcePath: config_claude_file_path(),
            defaultContent: {},
        });
    }

    async switch(modelName = "") {
        if (!modelName) {
            modelName = await this.handler(
                qsForChooseClaudeModel(claude_model),
            );
        }
        const option = await this.confirmOption(modelName);
        await this.writeConfig(modelName, option);
        return claude_model.find((val) => val.value === modelName)?.name;
    }

    async confirmOption(modelName: string) {
        const model = claude_model.find((val) => val.value === modelName);
        if (!model) throw new Error("切换claude模型失败，需要切换的模型不支持");

        let useCache = false;
        let config: IndexType<string> = {};
        let cacheConfig = this.#config.get(modelName);

        if (cacheConfig) {
            cacheConfig = JSON.parse(cacheConfig);
            const text = [];
            for (const ml of claude_model) {
                if (ml.value !== modelName) continue;
                for (const key in cacheConfig) {
                    text.push(
                        `${ml.option[key as keyof typeof ml.option].text}：${cacheConfig[key]}`,
                    );
                }
            }
            console.log(`\n${text.join("\n")}\n`);
            useCache = await this.handler(qsForUsePreClaudeOption());
        }

        if (useCache) {
            config = cacheConfig;
        } else {
            const option = model?.option;
            const keys = Object.keys(option);
            for await (const key of keys) {
                const val = option[key as keyof typeof option];
                let value = val?.value;
                if (!value) {
                    value = await this.handler(
                        qsForGeneralAsk(
                            `请输入必要的配置内容（${val?.text}）:`,
                        ),
                    );
                }
                config[key] = value as string;
            }
        }
        return config;
    }

    async writeConfig(modelName: string, option: IndexType<string>) {
        const configPath = resolve(homedir(), ".claude", "settings.json");
        if (exists(configPath)) {
            copyFile(
                configPath,
                resolve(dirname(configPath), `settings-back.json`),
                true,
            );
        }
        const content = { env: option };
        createFile(configPath, JSON.stringify(content, undefined, 2), true);

        const writeCache = await this.handler(qsForWriteClaudeOptionToCache());
        if (writeCache) this.#config.set(modelName, JSON.stringify(option));
    }

    async start() {
        if (getRuntimeConfig(RuntimeFlag.claude) === "-1") {
            throw new Error(
                "当前系统未安装claude，功能不可用。请根据链接的指引进行安装：https://github.com/anthropics/claude-code",
            );
        }

        const modelName = await this.switch();
        console.log(`${modelName} 模型切换成功，请在新打开的终端中验证~`);

        executeInTerminal("claude");
    }
}
