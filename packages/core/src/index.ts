import { BaseCommand } from "@core/module";
import { app_config } from "@core/constance";
import { checkSystem, createCacheDir, initRuntimeConfig } from "@vanner/common";

export class CommanderCore {
    public start(): void {
        this.init().then(() => {
            new BaseCommand().start();
        });
    }
    private async init(): Promise<void> {
        await checkSystem();
        initRuntimeConfig(app_config);
        createCacheDir();
    }
}
