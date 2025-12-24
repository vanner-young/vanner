import { Config as ConfigModule } from "@core/module/config";

export class Config extends ConfigModule {
    start(type: string, ...rest: any) {
        const typeHandler = new Map([
            ["list", this.outputList],
            ["get", this.getConfig],
            ["set", this.setConfig],
            ["delete", this.deleteConfig],
            ["reset", this.resetConfig],
        ]);
        const handler = typeHandler.get(type);
        if (handler) handler.apply(this, rest);
    }
}
