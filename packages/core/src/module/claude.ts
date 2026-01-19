import { homedir } from "node:os";
import { resolve, dirname } from "node:path";

import { Config } from "@module/config";
import { Inquirer } from "@module/inquirer";
import type { IndexType } from "mv-common/pkg/type";
import { exists, copyFile, createFile } from "mv-common/pkg/node/m.file";
import { config_claude_file_path } from "@core/constance/index";
import { qsForWriteClaudeOptionToCache } from "@core/constance/question";
import { executeInTerminal } from "@common/runtime";

export class Claude extends Inquirer {
    configPath = resolve(homedir(), ".claude", "settings.json"); // claude 配置文件目录
    backConfigPath = resolve(dirname(this.configPath), `settings-back.json`); // claude 备份配置文件目录

    config: Config = new Config({
        sourcePath: config_claude_file_path(),
        defaultContent: {},
    });

    async writeConfig(
        modelName: string,
        option: IndexType<string>,
        tipsCache = true
    ) {
        if (exists(this.configPath)) {
            copyFile(this.configPath, this.backConfigPath, true);
        }
        const content = { env: option };
        createFile(
            this.configPath,
            JSON.stringify(content, undefined, 2),
            true
        );

        if (!tipsCache) return;
        const writeCache = await this.handler(qsForWriteClaudeOptionToCache());
        if (writeCache) this.config.set(modelName, JSON.stringify(option));
    }

    openClaude() {
        return executeInTerminal("claude");
    }
}
