import { isEmptyJSON } from "mv-common/pkg/index";
import { RegisterCommand } from "@core/lib/register";
import { registerCommandOption } from "@core/lib/command";
import { getRuntimeConfig } from "@vanner/common";

export class BaseCommand extends RegisterCommand {
    constructor() {
        super({
            commandOption: registerCommandOption,
        });
    }
    start() {
        this.commandGlobalCatch((source, dest) => {
            const args = dest.args,
                isEmptySource = isEmptyJSON(source);
            if (args?.at(0) === "help" || (isEmptySource && !args.length)) {
                this.program.outputHelp();
            } else if (source.v) {
                console.log(getRuntimeConfig("app_version"));
            } else {
                console.log("无效的指令:", dest.args.join("、"));
            }
        });
        this.register();
    }
}
