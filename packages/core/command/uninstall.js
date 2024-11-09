const Package = require("@mvanners/package");
const { basicCommon, platform } = require("@mvanners/common");

class UnInstall {
    async start(packageList, option) {
        if (option.cli === "li")
            return console.log(`error: unknown option '-cli'`);

        const execPath = await platform.findProjectParentExecCwd();
        new Package({
            packageList,
            packageCli: platform.getPackageCli(execPath),
            registry: platform.getProcessEnv("default_registry"),
        }).action("uninstall");
    }
}

module.exports = new UnInstall();
