const { Package } = require("@mvanner/modules");
const { basicCommon, platform } = require("@mvanner/common");

class Install {
    start(packageList, option) {
        if (option.cli === "li")
            return console.log(`error: unknown option '-cli'`);

        new Package({
            packageList,
            packageCli:
                !option.cli || basicCommon.isType(option.cli, "boolean")
                    ? platform.getProcessEnv("default_package_cli")
                    : option.cli,
            register: platform.getProcessEnv("register"),
        }).install();
    }
}

module.exports = new Install();
