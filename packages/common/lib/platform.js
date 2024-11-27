const fs = require("fs");
const path = require("path");
const mvCommon = require("mv-common");
const axios = require("axios");

/**
 * 返回平台信息
 * **/
const platForm = () => {
    return mvCommon.getSystemInfo().platform;
};

/**
 * 是否是有效的AppData路径
 * **/
const effectiveAppDataHome = () => {
    const appDataHome = mvCommon.getAppData();
    if (!appDataHome) return;
    return fs.existsSync(appDataHome);
};

/**
 * 返回Node版本
 * **/
const nodeVersion = async () => {
    const result = await mvCommon.execCommand("node -v");
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
    packageCli = false,
    targetPath,
    dependencies = [],
    registry = "",
    commandPadStr = "",
) => {
    if (!packageCli || !verifyPackageCliName(packageCli)) {
        packageCli = getPackageCli(targetPath);
        console.log("包管理器无效，已重置为：", packageCli);
    }
    const dependenciesStr = dependencies.length
            ? ` ${dependencies.join(" ")}`
            : "",
        registryStr = registry ? ` --registry ${registry}` : "",
        packageCliStr =
            (packageCli === "pnpm" ? ` -w` : "") + ` ${commandPadStr}`;

    return mvCommon.execCommand(
        `${packageCli} ${!dependencies.length ? `install` : ["yarn", "pnpm"].includes(packageCli) ? "add" : "install"}${dependenciesStr}${packageCliStr}${registryStr}`,
        {
            cwd: targetPath,
            stdio: ["inherit", "inherit", "pipe"],
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
    registry = "",
) => {
    if (!packageCli || !verifyPackageCliName(packageCli)) {
        packageCli = getPackageCli(targetPath);
        console.log("包管理器无效，已重置为：", packageCli);
    }

    const dependenciesStr = dependencies.length
            ? ` ${dependencies.join(" ")}`
            : "",
        registryStr = registry ? ` --registry ${registry}` : "",
        packageCliStr = packageCli === "pnpm" ? ` -w` : "",
        packageRemoveStr = ["yarn", "pnpm"].includes(packageCli)
            ? "remove"
            : "uninstall";

    return mvCommon.execCommand(
        `${packageCli} ${packageRemoveStr}${dependenciesStr}${packageCliStr}`,
        {
            cwd: targetPath,
            stdio: ["inherit", "inherit", "pipe"],
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
        if (isDriveDirectory(targetPath)) return resolve(false);

        const recursionExecHandler = () =>
            resolve(parentExecHandlerPromise(path.dirname(targetPath), cb));

        if (mvCommon.isType(cb, "asyncfunction")) {
            cb(targetPath)
                .then((result) => {
                    if (!result) throw new Error("");
                    return resolve(result);
                })
                .catch(() => {
                    return recursionExecHandler();
                });
        } else {
            try {
                const result = cb(targetPath);
                if (result) return resolve(result);
                else throw new Error("");
            } catch (e) {
                return recursionExecHandler();
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
const findProjectParentExecCwd = (targetPath = process.cwd()) => {
    return findParentFile(targetPath, "package.json");
};

/**
 * 检测一个目录是否为有效的Git目录
 * @param { string } targetPath 目录路径
 * @returns { boolean } 是否为有效的Git路径
 * **/
const isActiveEmptyGitProject = (targetPath) => {
    const onlyGitFolder = path.resolve(targetPath, ".git");
    return fs.existsSync(onlyGitFolder);
};

const dfsParser = (dict, result) => {
    return result.reduce((pre, item) => {
        pre = pre?.[item];
        return pre;
    }, dict);
};

/**
 * 检测当前的脚手架是否符合要求
 * **/
const verifyPackageCliName = (name) => {
    return [
        ...mvCommon.packageMangerViewer.keys().toArray(),
        getProcessEnv("app_name"),
    ].includes(name);
};

/**
 * 判断一个地址是否能正常响应
 * **/
const responseUrl = async (url, options) => {
    if (!mvCommon.isValidUrl(url)) return false;
    try {
        const response = await axios.get(url, options);
        if (response.status === 200 && response.data) return true;
        else throw new Error(false);
    } catch (e) {
        return false;
    }
};

/**
 * 获取自定义模板路径
 * **/
const getTemplateList = () => {
    return mvCommon.readForTypeFileDir(
        getProcessEnv("app_customer_template_path"),
        "dir",
    );
};

/**
 * 获取某个自定义模板的路径
 * **/
const getTemplatePathByName = (name) => {
    return path.resolve(getProcessEnv("app_customer_template_path"), name);
};

/**
 * 判断一个地址是不是git地址
 * **/
const isValidGitUrl = (url) => {
    return /^(https?:\/\/|git@|ssh:\/\/)[^\s/$.?#].[^\s]*(\.git)$/.test(url);
};

module.exports = {
    platForm,
    effectiveAppDataHome,
    effectiveAppDataHome,
    nodeVersion,
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
    verifyPackageCliName,
    responseUrl,
    getTemplateList,
    getTemplatePathByName,
    isValidGitUrl,
};
