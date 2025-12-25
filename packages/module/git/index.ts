import { GitSync } from "@module/git/sync";
import { GitRemote } from "@module/git/remote";
import { GitInfo } from "@module/git/gitInfo";
import { GitCommit, type CommitProps } from "@module/git/commit";

import { execCommand } from "mv-common/pkg/node/m.process";
import { getStorageProjectName } from "@vanner/common";

export { GitInfo, GitCommit, GitRemote, GitSync };
export { type CommitProps };

export class Git extends GitInfo {
    async initGit() {
        await execCommand("git init", {
            stdio: "inherit",
        });
    }

    /**
     * 克隆一个项目至本地
     * @param { string } url 仓库地址
     * @param { string } cwd 工作目录
     * **/
    async clone(url: string, cwd?: string) {
        return await execCommand(`git clone ${url}`, {
            stdio: "inherit",
            cwd: cwd || process.cwd(),
        });
    }

    /**
     * 将已经提交至本地文件提交至远程
     * @param { CommitProps } props 推送仓库仓库的参数：远程地址名称、分支
     * **/
    async pushRemote(props: CommitProps) {
        const commit = new GitCommit(props);
        await commit.pushFileToRemote();
    }

    /**
     * 变更文件直接推送至远程
     * @param { object } props 推送的远程地址、分支、文件列表、提交信息
     * **/
    async commitPushRemote(
        props: CommitProps & {
            type: string;
            file: Array<string>;
            msg: string;
        }
    ) {
        const commit = new GitCommit({
            remote: props.remote,
            branch: props.branch,
        });
        await commit.addDiffFile(props.file);
        await commit.commitFileToLocal(props.type, props.msg);
        await commit.pushFileToRemote();
    }

    /**
     * 提交文件至本地
     * @param { object } props 提交的文件、提交信息
     * **/
    async commitToLocal(props: {
        file: Array<string>;
        type: string;
        msg: string;
    }) {
        const commit = new GitCommit();
        await commit.addDiffFile(props.file);
        await commit.commitFileToLocal(props.type, props.msg);
    }

    /**
     * 克隆一个项目至本地
     * **/
    async cloneGitProject(url: string, cwd: string) {
        await this.clone(url, cwd);

        return getStorageProjectName(url);
    }
}
