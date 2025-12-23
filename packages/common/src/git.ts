import { execCommand } from "mv-common/pkg/node/m.process";

/**
 * 判断一个地址是不是git地址
 * @param { string } url git地址
 * **/
export const isValidGitUrl = (url: string) => {
    return url.includes(".git") && url.length > 10;
    // return /^(https?:\/\/|git@|ssh:\/\/)[^\s/$.?#].[^\s]*(\.git)$/.test(url);
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
