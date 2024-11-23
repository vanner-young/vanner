"use strict";
const {
    platForm,
    setProcessEnv,
    getProcessEnv,
    effectiveAppDataHome,
} = require("@vanner/common/lib/platform");
const { basicCommon } = require("@vanner/common");

const {
    SUPPORT_SYSTEM,
    APP_DESCRIPTION,
    APP_CACHE_PATH,
    APP_TEMPLATE_PATH,
    APP_CONFIG_PATH,
    CUSTOMER_TEMPLATE_PATH,
} = require("./constance");

class MvCliCore {
    async start(pkgOption) {
        await this.checkSystem(); //  检查系统运行环境
        await this.initEnvVariable(pkgOption); // 初始化环境变量
        await this.createAppCacheDir(); // 创建必要的缓存目录

        require("./command").start(); // 初始化类序列
    }
    async checkSystem() {
        this.checkPlaterForm();
        this.checkAppHomeDir();
    }
    async createAppCacheDir() {
        const { app_cache_path, app_cache_template_path } = getProcessEnv([
            "app_cache_path",
            "app_cache_template_path",
        ]);
        basicCommon.createDir(app_cache_path);
        basicCommon.createDir(app_cache_template_path);
    }
    async initEnvVariable(pkgOption) {
        const envList = [
            { key: "app_name", value: pkgOption.name }, // 脚手架主命令
            { key: "app_version", value: pkgOption.version }, // 脚手架版本号
            { key: "app_description", value: APP_DESCRIPTION }, // 脚手架简介
            { key: "app_cache_path", value: APP_CACHE_PATH }, // 脚手架缓存根路径
            { key: "app_cache_config_path", value: APP_CONFIG_PATH }, // 脚手架配置文件路径
            { key: "app_cache_template_path", value: APP_TEMPLATE_PATH }, // 脚手架项目模板路径
            {
                key: "app_customer_template_path",
                value: CUSTOMER_TEMPLATE_PATH,
            },
        ];
        return setProcessEnv(envList);
    }
    checkPlaterForm() {
        if (!SUPPORT_SYSTEM.includes(platForm())) {
            throw Error(
                `当前系统平台不支持，目前支持的系统有: ${SUPPORT_SYSTEM.join("、").replace("win32", "windows")}`,
            );
        }
    }
    checkAppHomeDir() {
        if (!effectiveAppDataHome())
            throw Error("当前系统的用户目录不是有效的，请检查");
    }
}

module.exports = new MvCliCore();
