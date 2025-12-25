import { app_config } from "@core/constance";
import { BaseCommand } from "@/packages/core/src/command/main";
import {
    checkSystem,
    createCacheDir,
    setRuntimeConfig,
    getRuntimeFlag,
    RuntimeFlag,
} from "@vanner/common";
import { Config } from "@core/module/config";
import { ProcessErrorCatch } from "@mtool/error-catch/node";
import { IgnoreFlag } from "@core/constance/runtime";

export class CommanderCore {
    start(): void {
        this.init()
            .then(() => {
                new BaseCommand().start();
            })
            .catch((e) => {
                console.log(e);
                throw new Error("命令行工具初始化失败~" + e.message || e);
            });
    }

    private setAppConfig() {
        Object.entries(app_config).forEach(([key, value]) => {
            setRuntimeConfig(key, value);
        });
    }

    private tipsSystemEnv() {
        const git = getRuntimeFlag(RuntimeFlag.git);
        if (!git)
            console.warn(
                "\n当前系统未安装git, 相关git操作将无法使用，请根据此链接进行安装：https://git-scm.com \n"
            );
    }

    private updateDefaultConfig() {
        const cliFlag = getRuntimeFlag(RuntimeFlag.cli);

        // 包管理器处理
        if (cliFlag) {
            const config = new Config();
            const cli = config.get("package_cli");
            if (cliFlag === "bun" && cli !== "bun") {
                config.setConfig("package_cli", "bun");
            } else if (cliFlag === "node" && cli === "bun") {
                config.setConfig("package_cli", "npm");
            }
        }
    }

    private async init(): Promise<void> {
        await checkSystem(); // 检测系统环境
        this.setAppConfig(); // 初始化程序配置
        createCacheDir(); // 创建缓存目录
        this.tipsSystemEnv(); // 对系统中的工具环境进行提示
        this.updateDefaultConfig(); // 更新默认的配置

        const env = process.env.NODE_ENV;
        if (env === "production") {
            // 全局错误处理
            new ProcessErrorCatch().listen((_, error) => {
                const msg = error.message;
                if (msg !== IgnoreFlag)
                    console.error(`${process.env.APP_NAME} error: ${msg}`);
                process.exit(-1);
            });
        }
    }
}
