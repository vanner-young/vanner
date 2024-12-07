const { basicCommon, platform } = require("@vanner/common");
const RegisterCommandUtil = require("@vanner/registerCommand");

class BaseCommand extends RegisterCommandUtil {
    constructor() {
        super({
            commandOption: require("../constance/command"),
        });
    }
    start() {
        this.commandGlobalCatch((source, dest) => {
            const args = dest.args,
                isEmptySource = basicCommon.isEmptyJSON(source);
            if (args?.at(0) === "help" || (isEmptySource && !args.length)) {
                this.program.outputHelp();
            } else if (source.v) {
                console.log(platform.getProcessEnv("app_version"));
            } else {
                console.log("无效的指令:", dest.args.join("、"));
            }
        });
        this.register();
    }
}

module.exports = new BaseCommand();
