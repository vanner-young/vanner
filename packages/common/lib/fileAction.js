const fs = require("fs");
const path = require("path");
const basicCommon = require("mv-common");

const isDrivePath = (targetPath) => {
    targetPath = path.resolve(targetPath);
    return targetPath === path.parse(targetPath).root;
};

const readTargetFileTypeList = (targetPath, type = "dir") => {
    return fs.readdirSync(targetPath).filter((item) => {
        const itemPath = path.resolve(targetPath, item),
            statFile = fs.statSync(itemPath),
            statFileIsDir = statFile.isDirectory();
        if (basicCommon.isType(type, "function"))
            return type(itemPath, statFile);
        return type === "dir" ? statFileIsDir : !statFileIsDir;
    });
};

const isActiveEmptyGitProject = (targetPath) => {
    const onlyGitFolder = path.resolve(targetPath, ".git");
    return fs.existsSync(onlyGitFolder);
    // const packageFilePath = path.resolve(targetPath, "package.json");
    // const onlyGitFolder = path.resolve(targetPath, ".git");
    // if (!fs.existsSync(packageFilePath) || !fs.existsSync(onlyGitFolder))
    //     return;
    // try {
    //     const { name, version } = JSON.parse(
    //         basicCommon.readFileIsExists(packageFilePath).toString(),
    //     );
    //     return name.trim() || version.trim();
    // } catch (e) {
    //     console.log("check project active is fail...", targetPath);
    // }
};

module.exports = {
    isDrivePath,
    isActiveEmptyGitProject,
    readTargetFileTypeList,
};
