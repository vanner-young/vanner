const { basicCommon, platform } = require("@mv-cli/common");
const { RegisterCommand: RegisterCommandUtil } = require("@mv-cli/modules");

class BaseCommand extends RegisterCommandUtil {
    constructor() {
        super({
            commandOption: require("../constance/command"),
        });
    }
    start() {
        this.commandGlobalCatch((source, dest) => {
            if (basicCommon.isEmptyObject(source) && dest.args.length < 1) {
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
