import { execCommand } from "mv-common/pkg/node/m.process";

/**
 * 判断一个地址是不是git地址
 * @param { string } url git地址
 * **/
export const isValidGitUrl = (url: string): boolean => {
    if (!url || typeof url !== "string") {
        return false;
    }

    const trimmedUrl = url.trim();
    const gitUrlPattern =
        /^(https?:\/\/|git@|ssh:\/\/)[^\s/$.?#].[^\s]*?(?:\.git)?$/i;

    return gitUrlPattern.test(trimmedUrl);
};

/**
 * 判断当前系统是否安装git
 * **/
export const hasGit = async (): Promise<boolean> => {
    const result = await execCommand("git -v", {
        stdio: ["ignore", "pipe", "pipe"],
    });

    return result.includes("git version");
};

/**
 * 给定一个git地址，获取这个地址的项目名称
 * @param { string } url git仓库地址
 * **/
export const getStorageProjectName = (url: string) => {
    if (!isValidGitUrl(url)) return "";
    return url.match(/[\/:]([^\/]+?)(?:\.git)?$/)?.[1]?.trim();
};
