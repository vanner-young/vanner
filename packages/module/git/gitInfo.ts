/**
 * 获取Git的项目信息
 * **/
import { execCommand } from "mv-common/pkg/node/m.process";
import { GitRemote } from "@module/git/remote";

export class GitInfo {
    /**
     * 查看git环境是否存在
     * **/
    async env() {
        const source = await execCommand(
            `git rev-parse --is-inside-work-tree`,
            {
                stdio: ["ignore", "pipe", "ignore"],
            }
        );
        return source === "true";
    }

    /**
     * 查看git远程提交地址
     * **/
    async remote(): Promise<Array<{ origin: string; remote: string }>> {
        let { push } = await GitRemote.listRemote();
        return push.map((item) => {
            const [origin, remote] = item.split("\t").filter((item) => item);
            const [remoteUrl] = remote!.split(" ").filter((item) => item);
            return { origin: origin as string, remote: remoteUrl as string };
        });
    }

    /**
     * 获取当前所在的分支
     * **/
    async currentBranch(): Promise<string> {
        const source = await execCommand("git branch --show-current");
        return (source && source.replaceAll("\n", "")) || "";
    }

    /**
     * 查看项目git分支列表
     * @param { boolean } remote 是否需要获取远程分支
     * **/
    async branchList(remote: boolean): Promise<Array<string>> {
        let branchList = [];

        if (remote) {
            const source = await execCommand(`git branch -a`);
            branchList = source
                .split("\n")
                .map((item) => item.replace("* ", "").trim());
        } else {
            const source = await execCommand("git branch");
            branchList = source
                .split("\n")
                .map((item) => item.replace("* ", "").trim());
        }

        return branchList;
    }

    /**
     * 获取当前本地分支中，暂存区和工作区内的文件变更
     * **/
    async getWorkspaceAndTempStorageFile(): Promise<Array<string>> {
        const files = await execCommand("git status -s");
        const result = files
            .split("\n")
            .filter((item) => item)
            .map((item) => {
                const trimStr = item.trim();
                return trimStr
                    .slice(trimStr.indexOf(" ") + 1)
                    .replace(/\s+/g, "");
            });

        return result;
    }

    /**
     * 获取暂存区内的文件变更
     * **/
    async getTempStorageFile(): Promise<Array<string>> {
        const files = await execCommand("git diff --cached --name-only");
        return files
            .split("\n")
            .filter((item) => item)
            .map((item) => item.trim().replace(/\s+/g, ""));
    }

    /**
     * 获取当前工作区内文件变更
     * **/
    async getWorkspaceFile(): Promise<Array<string>> {
        const workspace = await execCommand("git diff --name-only");
        const unTrack = await execCommand(
            "git ls-files --others --exclude-standard"
        );
        return [...workspace.split("\n"), ...unTrack.split("\n")]
            .filter((item) => item)
            .map((item) => item.trim().replace(/\s+/g, ""));
    }

    /**
     * 查看当前分支中，已提交至本地但还未提交至远程的变更文件
     * **/
    async getNotPushRemoteFile() {
        const conteString = await execCommand(
            `git log --branches --not --remotes --name-only`
        );

        const list = conteString.split("\n").reverse();
        if (!list.length || !list.at(0)) return [];
        const fileList = [];
        for (const item of list) {
            if (item.trim()) fileList.push(item);
            else return fileList;
        }
    }

    /**
     * 查看git的提交日志
     * **/
    async showGitLog() {
        execCommand("git log", {
            stdio: "inherit",
        });
    }
}
