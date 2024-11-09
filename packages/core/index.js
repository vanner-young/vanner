"use strict";
const path = require("path");
const {
    backPlatForm,
    backNodeVersion,
    greaterNewVersion,
    effectiveAppDataHome,
    setProcessEnv,
    getProcessEnv,
} = require("@mvanners/common/lib/platform");
const { basicCommon } = require("@mvanners/common");

const {
    SUPPORT_SYSTEM,
    NODE_MINI_VERSION,
    APP_DIR_NAME,
    SOURCE_FILE_NAME,
    INIT_PROJECT_TEMPLATE_DIR_NAME,
    INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME,
    APP_DES,
} = require("./constance");

class MvCliCore {
    async start(pkgOption) {
        await this.checkSystem(); //  检查系统运行环境
        await this.initEnvVariable(pkgOption); // 初始化环境变量
        await this.createAppCacheDir(); // 创建必要的缓存目录

        require("./command").start(); // 初始化类序列
    }
    async checkSystem() {
        await this.checkNodeVersion();
        this.checkPlaterForm();
        this.checkAppHomeDir();
    }
    async createAppCacheDir() {
        const { app_cache_path, app_cache_template_path } = getProcessEnv([
            "app_cache_path",
            "app_cache_template_path",
        ]);
        basicCommon.createNotExistsFolder(app_cache_path);
        basicCommon.createNotExistsFolder(
            path.resolve(
                app_cache_template_path,
                INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME,
            ),
        );
    }
    async initEnvVariable(pkgOption) {
        const homePath = basicCommon.appData(),
            appCachePath = path.resolve(homePath, APP_DIR_NAME),
            appCacheTemplatePath = path.resolve(
                appCachePath,
                INIT_PROJECT_TEMPLATE_DIR_NAME,
            ),
            appSourceFilePath = path.resolve(appCachePath, SOURCE_FILE_NAME);
        const envList = [
            { key: "app_dir", value: homePath }, // 用户家目录
            { key: "node_version", value: await backNodeVersion() }, // node 版本
            { key: "support_system", value: JSON.stringify(SUPPORT_SYSTEM) }, // 支持的操作系统
            { key: "support_node_version", value: NODE_MINI_VERSION }, // 支持的最低node版本
            { key: "app_cache_dir_name", value: APP_DIR_NAME }, // 脚手架缓存目录名称
            { key: "app_des", value: APP_DES }, // 脚手架简介
            { key: "source_file_name", value: SOURCE_FILE_NAME }, // 脚手架缓存文件名称
            { key: "app_version", value: pkgOption.version }, // 脚手架版本号
            { key: "app_name", value: pkgOption.name }, // 脚手架主命令
            { key: "app_source_file_path", value: appSourceFilePath }, // 脚手架缓存资源文件路径
            { key: "app_cache_path", value: appCachePath }, // 脚手架缓存目录路径
            { key: "app_cache_template_path", value: appCacheTemplatePath }, // 脚手架项目模板缓存路径
        ];
        return setProcessEnv(envList);
    }
    async checkNodeVersion() {
        const nodeVersion = await backNodeVersion();
        if (greaterNewVersion(nodeVersion, NODE_MINI_VERSION))
            throw Error(
                "当前node版本不支持，目前支持的Node版本最低为" +
                    NODE_MINI_VERSION,
            );
    }
    checkPlaterForm() {
        if (!SUPPORT_SYSTEM.includes(backPlatForm()))
            throw Error("当前系统平台不支持，目前支持的系统有: windows");
    }
    checkAppHomeDir() {
        if (!effectiveAppDataHome())
            throw Error("当前系统的用户目录不是有效的，请检查");
    }
}

module.exports = new MvCliCore();
