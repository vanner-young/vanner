const Package = require("@vanner/package");
const { basicCommon, platform } = require("@vanner/common");

class Install {
    async start(packageList, option) {
        const execPath = await basicCommon.findParentFile(
            process.cwd(),
            "package.json",
        );

        new Package({
            packageList,
            cwd: execPath,
            type: option,
            packageCli: platform.getPackageCli(execPath),
            registry: platform.getProcessEnv("default_registry"),
        }).action();
    }
}

module.exports = new Install();
