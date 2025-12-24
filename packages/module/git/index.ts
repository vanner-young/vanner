import { GitInfo } from "./gitInfo";
import { GitCommit, type CommitProps } from "./commit";
import { Remote } from "./remote";

import { execCommand } from "mv-common/pkg/node/m.process";
import { getStorageProjectName } from "@vanner/common";

export { GitInfo, GitCommit, Remote };
export { type CommitProps };

export class Git extends GitInfo {
    public async initGit() {
        await execCommand("git init", {
            stdio: "inherit",
        });
    }

    public async clone(url: string, cwd?: string) {
        await execCommand(`git clone ${url}`, {
            stdio: "inherit",
            cwd: cwd || process.cwd(),
        });
    }

    /**
     * 将已经提交至本地文件提交至远程
     * **/
    public async pushRemote(props: CommitProps & { tag?: string }) {
        const commit = new GitCommit(props);
        await commit.pushFileToRemote();
        if (props.tag)
            await commit.releaseTag({
                remote: props.remote as string,
                tag: props.tag,
            });
    }

    /**
     * 变更文件直接推送至远程
     * @param { object } props 推送的远程地址、分支、文件列表、提交信息
     * **/
    public async commitPushRemote(
        props: CommitProps & {
            type: string;
            file: Array<string>;
            msg: string;
            tag?: string;
        }
    ) {
        const commit = new GitCommit({
            remote: props.remote,
            branch: props.branch,
        });
        await commit.addDiffFile(props.file);
        await commit.commitFileToLocal(props.type, props.msg);
        await commit.pushFileToRemote();
        if (props.tag)
            await commit.releaseTag({
                remote: props.remote as string,
                tag: props.tag,
            });
    }

    /**
     * 提交文件至本地
     * @param { object } props 提交的文件、提交信息
     * **/
    public async commitToLocal(props: {
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
    public async cloneGitProject(url: string, cwd: string) {
        const pjName = getStorageProjectName(url);
        if (!pjName)
            throw new Error("git 仓库地址无效，无法获取到指定的git项目名称~");

        await this.clone(url, cwd);
        console.log(`项目初始化成功！，请进入：${pjName} 目录进行操作。`);
    }
}
