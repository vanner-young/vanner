const Package = require("@vanner/package");
const { basicCommon, platform } = require("@vanner/common");

class Install {
    async start(packageList, option) {
        const execPath = option.dir
            ? option.dir
            : await basicCommon.findParentFile(process.cwd(), "package.json");

        new Package({
            packageList,
            cwd: execPath,
            packageCli: option.cli || platform.getPackageCli(execPath),
            registry: platform.getProcessEnv("default_registry"),
        }).action();
    }
}

module.exports = new Install();
