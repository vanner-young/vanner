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
const installDependencies = (packageCli = null, targetPath) => {
    packageCli = getPackageCli(targetPath);
    return mvCommon.execCommandPro(`${packageCli} install`, {
        cwd: targetPath,
        stdio: "inherit",
    });
};

/**
 * 判断某个路径是否是js项目环境
 * **/
const invalidProjectInstallEnv = (targetPath) => {
    return fs.existsSync(path.resolve(targetPath, "package.json"));
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
};
