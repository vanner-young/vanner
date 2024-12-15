const fs = require("fs");
const path = require("path");
const Inquirer = require("@vanner/inquirer");
const { platform } = require("@vanner/common");

const { chooseVersion } = require("../constance/question");

class Version extends Inquirer {
    generatorVersionList(version) {
        if (!version) {
            version = "0.0.0";
            console.warn(
                "当前项目中未存在version版本，将默认重置为：",
                version,
            );
        }

        const spt = version.indexOf("-");
        if (spt !== -1) version = version.slice(0, spt);
        version = version.trim();

        const splitVersion = version.split(".");
        const versionList = [];
        for (let i = splitVersion.length - 1; i > -1; i--) {
            const item = splitVersion[i];
            const newV = Number(item) + 1;

            const prefix = splitVersion.slice(0, i).join("."),
                suffix = splitVersion.slice(i + 1).join(".");

            const newVersion = `${prefix ? prefix + "." : ""}${newV}${suffix ? "." + suffix : ""}`;
            versionList.push(newVersion, `${newVersion}-beat`);
        }
        versionList.push(version);
        return versionList;
    }

    async start() {
        const cwd = await platform.findProjectParentExecCwd();
        if (!cwd)
            throw new Error(
                "当前路径及其父级不存在可执行的项目，请切换后重试！",
            );

        const packagePath = path.resolve(cwd, "package.json");
        const packageContent = JSON.parse(
                fs.readFileSync(packagePath, { encoding: "utf-8" }),
            ),
            version = packageContent.version;

        const versionResult = this.generatorVersionList(version);
        const versionValue = await this.handler(
            chooseVersion(versionResult, version),
        );

        if (version === versionValue) return version;
        packageContent.version = versionValue;
        fs.writeFileSync(packagePath, JSON.stringify(packageContent, null, 4), {
            encoding: "utf-8",
        });
        return packageContent.version;
    }
}

module.exports = new Version();
