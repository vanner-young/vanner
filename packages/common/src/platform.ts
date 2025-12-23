import {
    getAppData,
    execCommand,
    getSystemInfo,
} from "mv-common/pkg/node/m.process";
import { createDir } from "mv-common/pkg/node/m.file";
import { app_cache_path } from "@core/constance";
import { setRuntimeFlag, RuntimeFlag, hasGit } from "@common/index";

/**
 * 返回Node版本
 * **/
const nodeVersion = async () => {
    try {
        const result = await execCommand("node -v");
        return result?.slice(1);
    } catch (e) {
        return "";
    }
};

/**
 * 返回bun的版本
 * **/
export const bunVersion = async () => {
    try {
        const result = await execCommand("bun -v");
        return result?.slice(1);
    } catch (e) {
        return "";
    }
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

    const git = await hasGit();
    setRuntimeFlag(RuntimeFlag.git, String(git ? 1 : 0));

    const nodeVer = await nodeVersion();
    const bunVer = await bunVersion();

    if (nodeVer && bunVer) {
        return;
    }

    if (!nodeVer && !bunVer) {
        throw new Error("未检测到Node且Bun环境，至少安装一个：Node、Bun");
    }

    setRuntimeFlag(RuntimeFlag.cli, bunVer ? "bun" : "node");
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
