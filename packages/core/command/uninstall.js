const Package = require("@vanner/package");
const { basicCommon, platform } = require("@vanner/common");

class UnInstall {
    async start(packageList, option) {
        if (option.cli === "li")
            return console.log(`error: unknown option '-cli'`);

        const execPath = await basicCommon.findParentFile(
            process.cwd(),
            "package.json",
        );
        new Package({
            packageList,
            cwd: execPath,
            packageCli: option.cli || platform.getPackageCli(execPath),
            registry: platform.getProcessEnv("default_registry"),
        }).action("uninstall");
    }
}

module.exports = new UnInstall();
