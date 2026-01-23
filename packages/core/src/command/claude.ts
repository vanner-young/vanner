import {
    qsForGeneralAsk,
    qsForChooseClaudeModel,
    qsForUsePreClaudeOption,
} from "@core/constance/question";
import type { IndexType } from "mv-common/pkg/type";
import { claude_model } from "@core/constance/runtime";
import { Claude as ClaudeModule } from "@core/module/claude";

import { promptForFilePath } from "@common/util";
import { getRuntimeConfig, RuntimeFlag } from "@common/runtime";

export enum ClaudeType {
    switch = "switch",
    import = "import",
}

export class Claude extends ClaudeModule {
    // 是否使用缓存
    useCache = false;

    /**
     * 确认claude的配置信息
     * **/
    async confirmOption(modelName: string) {
        const model = claude_model.find((val) => val.value === modelName);
        if (!model) throw new Error("切换claude模型失败，需要切换的模型不支持");

        let useCache = false;
        let config: IndexType<string> = {};
        let cacheConfig = this.config.get(modelName);

        if (cacheConfig) {
            cacheConfig = JSON.parse(cacheConfig);
            const text = [];
            for (const ml of claude_model) {
                if (ml.value !== modelName) continue;
                for (const key in cacheConfig) {
                    text.push(
                        `${ml.option[key as keyof typeof ml.option].text}：${
                            cacheConfig[key]
                        }`,
                    );
                }
            }
            console.log(`\n${text.join("\n")}\n`);
            useCache = await this.handler(qsForUsePreClaudeOption());
        }

        if (useCache) {
            config = cacheConfig;
            this.useCache = true;
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

    /**
     * 切换 claude 模型
     * **/
    async switch(modelName = "") {
        if (!modelName) {
            modelName = await this.handler(
                qsForChooseClaudeModel(claude_model),
            );
        }
        const option = await this.confirmOption(modelName);
        await this.writeConfig(modelName, option, !this.useCache);

        const name = claude_model.find((val) => val.value === modelName)?.name;
        console.log(`${name} 模型切换成功，请在新打开的终端中验证~`);
        this.openClaude();
    }

    /**
     * 导入 claude 模型
     * **/
    async import() {
        const filePath = await promptForFilePath({
            extension: ".json",
            message: "请选择claude模型的配置文件（json 格式）",
        });
        let config = require(filePath as string);
        config = config?.env || {};
        const configKey = [
            "ANTHROPIC_BASE_URL",
            "ANTHROPIC_AUTH_TOKEN",
            "ANTHROPIC_MODEL",
        ];

        const notExistsKey = configKey.find((key) => !config[key]);
        if (notExistsKey) {
            throw new Error(
                `配置文件内容无效，${configKey.join("、")}值必须存在~`,
            );
        }

        await this.writeConfig(config["ANTHROPIC_MODEL"], config, false);
        console.log(
            `${config["ANTHROPIC_MODEL"]} 模型导入成功，请在新打开的终端中验证~`,
        );
        this.openClaude();
    }

    async start(type: ClaudeType) {
        if (getRuntimeConfig(RuntimeFlag.claude) === "-1") {
            throw new Error(
                "当前系统未安装claude，功能不可用。请根据链接的指引进行安装：https://github.com/anthropics/claude-code",
            );
        }

        if (type === ClaudeType.switch) this.switch();
        else if (type === ClaudeType.import) await this.import();
    }
}
