import { GitSync } from "@module/git/sync";
import { execCommand } from "mv-common/pkg/node/m.process";

export interface CommitProps {
    remote?: string; // 仓库远程地址名称
    branch?: string; // 分支名称
}

export class GitCommit {
    #config: CommitProps;

    constructor(props: CommitProps = {}) {
        this.#config = { ...props };
    }

    /**
     * 暂存变更文件
     * **/
    async addDiffFile(file: Array<string>) {
        const command = `git add ${file.join(" ")}`;
        return await execCommand(command, {
            stdio: "inherit",
        });
    }

    /**
     * 将变更文件提交至本地
     * **/
    async commitFileToLocal(type: string, msg: string) {
        const command = `git commit -m "${type}:${msg}"`;
        return await execCommand(command, {
            stdio: "inherit",
        });
    }

    /**
     * 将本地提交的文件推送至远程仓库
     * **/
    async pushFileToRemote() {
        const { remote, branch } = this.#config;
        if (!remote || !branch)
            throw new Error("缺少远程地址或分支，推送失败！");

        const command = `git push ${remote} ${branch}`;
        await execCommand(command, {
            stdio: "inherit",
        });
    }

    /**
     * 重写最近一次的提交信息
     * **/
    async rewriteCommitMsg(type: string, msg: string) {
        return await execCommand(`git commit --amend -m "${type}:${msg}"`, {
            stdio: "inherit",
        });
    }

    /**
     * 撤销最近的一次commit文件至暂存区(仍保留代码修改的内容)
     * **/
    async resetFileToCommit() {
        return await execCommand(`git reset --soft HEAD~1`, {
            stdio: "inherit",
        });
    }

    /**
     * 撤销暂存区的文件
     * **/
    async resetTempStorageFile(file: Array<string>) {
        return await execCommand(`git reset ${file.join(" ")}`, {
            stdio: "inherit",
        });
    }

    /**
     * 获取当前仓库的tag列表
     * **/
    async tags() {
        await GitSync.syncTag();
        const tagStr = await execCommand("git tag", {
            stdio: ["ignore", "pipe", "ignore"],
        });
        return tagStr
            .split("\n")
            .filter((t) => t)
            .map((t) => t.trim().replace(/\s+/g, ""));
    }

    /**
     * 提交标签版本
     * **/
    async releaseTag(option: { remote: string; tag: string }) {
        const tagVersion = `v${option.tag}`;
        const tags = await this.tags();

        if (tags.includes(tagVersion))
            throw new Error(
                `标签：${tagVersion} 已存在当前仓库标签列表，推送失败~`
            );

        await execCommand(
            `git tag -a v${option.tag} -m "Release version ${option.tag}"`,
            {
                stdio: "inherit",
            }
        );
        await execCommand(`git push ${option.remote} ${tagVersion}`, {
            stdio: "inherit",
        });
    }
}
