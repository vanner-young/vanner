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
    public async addDiffFile(file: Array<string>) {
        const command = `git add ${file.join(" ")}`;
        return await execCommand(command, {
            stdio: "inherit",
        });
    }

    /**
     * 将变更文件提交至本地
     * **/
    public async commitFileToLocal(type: string, msg: string) {
        const command = `git commit -m "${type}:${msg}"`;
        return await execCommand(command, {
            stdio: "inherit",
        });
    }

    /**
     * 将本地提交的文件推送至远程仓库
     * **/
    public async pushFileToRemote() {
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
    public async rewriteCommitMsg(type: string, msg: string) {
        return await execCommand(`git commit --amend -m "${type}:${msg}"`, {
            stdio: "inherit",
        });
    }

    /**
     * 撤销最近的一次commit文件至暂存区(仍保留代码修改的内容)
     * **/
    public async resetFileToCommit() {
        return await execCommand(`git reset --soft HEAD~1`, {
            stdio: "inherit",
        });
    }

    /**
     * 撤销暂存区的文件
     * **/
    public async resetTempStorageFile(file: Array<string>) {
        return await execCommand(`git reset ${file.join(" ")}`, {
            stdio: "inherit",
        });
    }

    /**
     * 提交标签版本
     * **/
    public async releaseTag(option: { remote: string; tag: string }) {
        await execCommand(
            `git tag -a v${option.tag} -m "Release version ${option.tag}"`,
            {
                stdio: "inherit",
            }
        );
        await execCommand(`git push ${option.remote} v${option.tag}`, {
            stdio: "inherit",
        });
    }
}
