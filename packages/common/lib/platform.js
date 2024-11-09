const fs = require("fs");
const path = require("path");
const mvCommon = require("mv-common");

/**
 * 返回平台信息
 * **/
const backPlatForm = () => {
    return mvCommon.systemInfo().platform;
};

/**
 * 是否是有效的AppData路径
 * **/
const effectiveAppDataHome = () => {
    const appDataHome = mvCommon.appData();
    if (!appDataHome) return;
    return fs.existsSync(appDataHome);
};

/**
 * 返回Node版本
 * **/
const backNodeVersion = async () => {
    const result = await mvCommon.getExecCommandResult("node -v");
    return result?.slice(1);
};

/**
 * 比较版本信息
 * **/
const greaterNewVersion = (version, nVersion) => {
    return (
        Number((version.match(/\d+/g) || []).join("")) <
        Number((nVersion.match(/\d+/g) || []).join(""))
    );
};

/**
 * 设置环境变量
 * **/
const setProcessEnv = (key, value) => {
    if (Array.isArray(key)) {
        for (const item of key) {
            const envKey = `MV_CLI_${item.key.toUpperCase()}`;
            process.env[envKey] = item.value;
        }
    } else {
        const envKey = `MV_CLI_${key.toUpperCase()}`;
        process.env[envKey] = value;
    }
};

/**
 * 获取环境变量
 * **/
const getProcessEnv = (key) => {
    if (Array.isArray(key)) {
        return key.reduce((pre, next) => {
            pre[next] = process.env[`MV_CLI_${next.toUpperCase()}`];
            return pre;
        }, {});
    }
    return process.env[`MV_CLI_${key.toUpperCase()}`];
};

/**
 * 获取指定路径下方使用的是什么的包管理器
 * **/
const getPackageCli = (targetPath) => {
    return (
        mvCommon.getPackageMangerName(targetPath) ||
        getProcessEnv("default_package_cli") ||
        "npm"
    );
};

/**
 * 在某个路径下执行依赖的安装
 * **/
const installDependencies = (
    packageCli = null,
    targetPath,
    dependencies = [],
    registry = null,
) => {
    if (!packageCli) packageCli = getPackageCli(targetPath);

    const dependenciesStr = dependencies.length
            ? ` ${dependencies.join(" ")}`
            : "",
        registryStr = registry ? ` --registry ${registry}` : "",
        packageCliStr = packageCli === "pnpm" ? ` -w` : "";
    return mvCommon.execCommandPro(
        `${packageCli} ${packageCli === "yarn" ? "add" : "install"}${dependenciesStr}${packageCliStr}${registryStr}`,
        {
            cwd: targetPath,
            stdio: "inherit",
        },
    );
};

/**
 * 在某个路径下删除依赖的安装
 * **/
const uninstallDependencies = (
    packageCli = null,
    targetPath,
    dependencies = [],
    registry = null,
) => {
    if (!packageCli) packageCli = getPackageCli(targetPath);

    const dependenciesStr = dependencies.length
            ? ` ${dependencies.join(" ")}`
            : "",
        registryStr = registry ? ` --registry ${registry}` : "",
        packageCliStr = packageCli === "pnpm" ? ` -w` : "",
        packageRemoveStr = ["yarn", "pnpm"].includes(packageCli)
            ? "remove"
            : "uninstall";

    return mvCommon.execCommandPro(
        `${packageCli} ${packageRemoveStr}${dependenciesStr}${packageCliStr}`,
        {
            cwd: targetPath,
            stdio: "inherit",
        },
    );
};

/**
 * 判断某个路径是否是js项目环境
 * **/
const invalidProjectInstallEnv = (targetPath) => {
    return fs.existsSync(path.resolve(targetPath, "package.json"));
};

/**
 * 判断一个目录是否是盘符目录
 * **/
const isDriveDirectory = (targetPath) => {
    targetPath = path.resolve(targetPath);
    return targetPath === path.parse(targetPath).root;
};

/**
 * 向上层级执行一个函数，直到返回成功为止
 * **/
const parentExecHandlerPromise = (targetPath, cb) => {
    return new Promise((resolve) => {
        if (isDriveDirectory(targetPath)) resolve(false);

        const recursionExecHandler = () =>
            resolve(parentExecHandlerPromise(path.dirname(targetPath), cb));

        if (mvCommon.isType(cb, "asyncfunction")) {
            cb(targetPath)
                .then((result) => {
                    if (!result) throw new Error("");
                    resolve(result);
                })
                .catch(() => {
                    recursionExecHandler();
                });
        } else {
            try {
                const result = cb(targetPath);
                if (result) resolve(result);
                else throw new Error("");
            } catch (e) {
                recursionExecHandler();
            }
        }
    });
};

/**
 * 向上查询文件的存在目录
 * @param { string } targetPath 基准目录
 * @param { string } handler 文件名称或执行函数
 * @returns { string } 查询到的文件目录
 * **/
const findParentFile = (targetPath, handler) => {
    return parentExecHandlerPromise(targetPath, async (cwd) => {
        let result = null;
        if (mvCommon.isType(handler, "string")) {
            result = fs.existsSync(path.resolve(cwd, handler));
        } else if (mvCommon.isType(handler, "function")) {
            result = handler(cwd);
        } else if (mvCommon.isType(handler, "asyncfunction")) {
            result = await handler(cwd);
        } else {
            throw new Error("invalid handler parameter");
        }
        return result ? cwd : result;
    });
};

/**
 * 向上查询项目的可执行目录
 * @param { string } targetPath 基准目录
 * @returns { string } 查询到的可执行文件目录
 * **/
const findProjectParentExecCwd = async (targetPath = process.cwd()) => {
    const result = await findParentFile(targetPath, "package.json");
    if (!result) throw new Error("当前及父级目录下不是一个项目目录");
    return result;
};

/**
 * 检测一个目录是否为有效的Git目录
 * @param { string } targetPath 目录路径
 * @returns { boolean } 是否为有效的Git路径
 * **/
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

const dfsParser = (dict, result) => {
    return result.reduce((pre, item) => {
        pre = pre?.[item];
        return pre;
    }, dict);
};

module.exports = {
    backPlatForm,
    effectiveAppDataHome,
    effectiveAppDataHome,
    backNodeVersion,
    greaterNewVersion,
    setProcessEnv,
    getProcessEnv,
    installDependencies,
    getPackageCli,
    invalidProjectInstallEnv,
    parentExecHandlerPromise,
    findParentFile,
    findProjectParentExecCwd,
    isActiveEmptyGitProject,
    dfsParser,
    uninstallDependencies,
};
