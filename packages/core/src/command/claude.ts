import { homedir } from "node:os";
import { resolve, dirname } from "node:path";

import { Config } from "@module/config";
import { Inquirer } from "@module/inquirer";
import { getRuntimeConfig, RuntimeFlag } from "@common/runtime";
import type { IndexType } from "mv-common/pkg/type";
import { exists, copyFile, createFile } from "mv-common/pkg/node/m.file";

import { claudeModel, config_claude_file_path } from "@core/constance/index";
import {
    qsForGeneralAsk,
    qsForChooseClaudeModel,
    qsForUsePreClaudeOption,
} from "@core/constance/question";

export class Claude extends Inquirer {
    #config: Config;

    constructor() {
        super();

        this.#config = new Config({
            sourcePath: config_claude_file_path(),
            defaultContent: {},
        });
    }

    async writeConfig(modelName: string, option: IndexType<string>) {
        const configPath = resolve(homedir(), ".claude", "settings.json");
        if (exists(configPath)) {
            copyFile(
                configPath,
                resolve(dirname(configPath), `settings-back.json`),
                true
            );
        }
        const content = { env: option };
        createFile(configPath, JSON.stringify(content, undefined, 2), true);

        // 将配置信息写入缓存
        this.#config.set(modelName, JSON.stringify(option));
    }

    async confirmOption(modelName: string) {
        const model = claudeModel.find((val) => val.value === modelName);
        if (!model) throw new Error("切换claude模型失败，需要切换的模型不支持");

        let useCache = false;
        let config: IndexType<string> = {};
        const cacheConfig = this.#config.get(modelName);
        if (cacheConfig)
            useCache = await this.handler(qsForUsePreClaudeOption());

        if (useCache) {
            config = JSON.parse(cacheConfig);
        } else {
            const option = model?.option;
            const keys = Object.keys(option);
            for await (const key of keys) {
                const val = option[key as keyof typeof option];
                let value = val?.value;
                if (!value) {
                    value = await this.handler(
                        qsForGeneralAsk(`请输入必要的配置内容（${val?.text}）:`)
                    );
                }
                config[key] = value as string;
            }
        }
        return config;
    }

    async switch(modelName = "") {
        if (!modelName) {
            modelName = await this.handler(qsForChooseClaudeModel(claudeModel));
        }
        const option = await this.confirmOption(modelName);
        await this.writeConfig(modelName, option);
        return claudeModel.find((val) => val.value === modelName)?.name;
    }

    async start() {
        if (getRuntimeConfig(RuntimeFlag.claude) === "-1") {
            throw new Error(
                "当前系统未安装claude，功能不可用。请根据链接的指引进行安装：https://github.com/anthropics/claude-code"
            );
        }

        const modelName = await this.switch();
        console.log(
            `${modelName} 模型切换成功，请重启已打开的claude终端后输入：‘claude’ 命令验证~`
        );
    }
}
