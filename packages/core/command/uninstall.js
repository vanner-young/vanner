const Package = require("@mvanners/package");
const { basicCommon, platform } = require("@mvanners/common");

class UnInstall {
    start(packageList, option) {
        if (option.cli === "li")
            return console.log(`error: unknown option '-cli'`);

        new Package({
            packageList,
            packageCli:
                !option.cli || basicCommon.isType(option.cli, "boolean")
                    ? platform.getProcessEnv("default_package_cli")
                    : option.cli,
            registry: platform.getProcessEnv("default_registry"),
        }).action("uninstall");
    }
}

module.exports = new UnInstall();
