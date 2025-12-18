import {
    getAppData,
    execCommand,
    getSystemInfo,
} from "mv-common/pkg/node/m.process";
import { createDir } from "mv-common/pkg/node/m.file";
import { app_cache_path, support_node_version } from "@core/constance";

/**
 * 返回Node版本
 * **/
const nodeVersion = async () => {
    const result = await execCommand("node -v");
    return result?.slice(1);
};

/**
 * 检测系统环境是否支持
 * **/
export const checkSystem = async () => {
    const { isWindow } = getSystemInfo();
    if (!isWindow)
        throw new Error(
            `当前工具仅支持的系统平台有：${process.env.APP_SUPPORT_SYSTEM}`
        );

    const result = await nodeVersion().catch(() => {
        throw new Error("获取node版本失败");
    });

    const mainVersion = result.split(".")[0];
    if (!mainVersion || Number(mainVersion) < support_node_version) {
        throw new Error(
            `当前node版本不支持此工具，最低支持的node版本为：${support_node_version}`
        );
    }
};

/**
 * 创建缓存目录
 * **/
export const createCacheDir = () => {
    const appDataPath = getAppData();
    if (!appDataPath) {
        throw new Error("工具缓存目录创建失败");
    }
    createDir(app_cache_path(), false);
};

/**
 * 初始化必要的环境变量
 * **/
export const initSystemEnv = () => {};
