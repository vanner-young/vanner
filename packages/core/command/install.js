const Package = require("@mvanners/package");
const { platform } = require("@mvanners/common");

class Install {
    async start(packageList, option) {
        if (option.cli === "li")
            return console.log(`error: unknown option '-cli'`);

        const execPath = await platform.findProjectParentExecCwd();
        new Package({
            packageList,
            packageCli: platform.getPackageCli(execPath),
            registry: platform.getProcessEnv("default_registry"),
        }).action();
    }
}

module.exports = new Install();
