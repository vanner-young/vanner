import { resolve } from "node:path";
import { Inquirer, Remote, Git, GitCommit } from "@vanner/module";
import {
    qsForChooseRemote,
    qsForAddStorageRemote,
    qsForPushType,
    qsForStraightforwardPushRemote,
    qsForTempStorageFile,
    qsForAskInitStorage,
    qsForResetStorageFile,
} from "@core/constance/quetion";
import { isValidGitUrl } from "@vanner/common";
import { commit_type_list } from "@core/constance";
import { IgnoreFlag } from "@core/constance/runtime";
import { getRuntimeFlag, RuntimeFlag, searchCwdPath } from "@vanner/common";

export class PjGit extends Git {
    #inquirer: Inquirer;

    constructor() {
        super();
        this.#inquirer = new Inquirer();
    }

    /**
     * 确认git环境, 当不存在时，指引其初始化
     * **/
    public async confirmGitEnv() {
        const git = getRuntimeFlag(RuntimeFlag.git);
        if (!Number(git)) throw new Error("当前系统未安装git，请安装后重试~");

        const hasGit = await this.env();
        if (!hasGit) {
            const init = await this.#inquirer.handler(qsForAskInitStorage());
            if (init) await this.initGit();
            throw new Error(IgnoreFlag);
        }
    }

    /**
     * 确认操作仓库的远程地址
     * **/
    public async confirmGitRemote(): Promise<string | void> {
        let remote = "";
        const remoteList = await this.remote(); // 获取项目源地址

        if (remoteList.length <= 0) {
            const originRemote = (await this.#inquirer.handler(
                qsForAddStorageRemote(
                    "当前仓库中不存在远程地址，请添加：(名称和地址使用仅一个空格隔开)<remote-name> <remote-url>\n"
                )
            )) as string;

            const [name, url] = originRemote.split(" ");
            if (!name?.trim() || !isValidGitUrl(url as string)) {
                throw new Error("远程地址名称或地址无效，请重试！");
            }
            await Remote.addRemote(name, url as string);
            throw new Error(IgnoreFlag);
        } else {
            if (remoteList.length > 1) {
                remote = await this.#inquirer.handler(
                    qsForChooseRemote(
                        remoteList.map((it) => it.origin as string)
                    )
                );
            } else {
                remote = remoteList[0]?.origin as string;
            }
        }

        return remote;
    }

    /**
     * 确认操作仓库的分支名称(currentBranch 会在即使仓库没有分支的情况下，仍存在默认的main|master分支)
     * **/
    public async confirmBranch(): Promise<string | void> {
        const branch = await this.currentBranch();
        if (branch) return branch;

        throw new Error("当前所在分支为空，请切换分支后重试~");
    }

    /**
     * 确认本地提交的文件
     * **/
    public async confirmLocalCommitFile(): Promise<Array<string>> {
        let dfFile = await this.getWorkspaceFile(); // 获取还未提交至本地的文件
        return dfFile.length
            ? await this.#inquirer.handler(qsForTempStorageFile(dfFile))
            : dfFile;
    }

    /**
     * 确认本次需要提交的文件
     * **/
    public async confirmPushFile(): Promise<{
        type: "local" | "remote";
        file: Array<string>;
    } | void> {
        let type: "local" | "remote" = "local";
        let localFile = await this.confirmLocalCommitFile(); // 确认需要提交至本地的文件

        if (!localFile.length) {
            const citFile = await this.getNotPushRemoteFile(); // 查看是否存在未提交至远程的代码文件
            if (!citFile?.length)
                throw new Error("当前分支下，不存在需要提交的文件~");

            const isPushFile = await this.#inquirer.handler(
                qsForStraightforwardPushRemote()
            );
            if (isPushFile) {
                type = "remote";
                localFile = citFile;
            } else {
                throw new Error(IgnoreFlag);
            }
        }

        return { type, file: localFile };
    }

    /**
     * 确认本次提交的类型
     * **/
    public async confirmPushType(): Promise<{
        type: string;
        msg: string;
    }> {
        const types = Object.keys(commit_type_list).map((key) => ({
            name: `${key}：${
                commit_type_list[key as keyof typeof commit_type_list]
            }`,
            value: key,
        }));

        return await this.#inquirer.handler(qsForPushType(types));
    }

    /**
     * 修改最近的一次commit消息
     * **/
    public async rewriteMsg() {
        const { type, msg } = await this.confirmPushType();
        await new GitCommit().rewriteCommitMsg(type, msg);
        this.showGitLog();
    }

    /**
     * 撤销暂存区或本地的提交(仍保留修改内容)
     * **/
    public async resetTempOrCommitAction(type: "local" | "commit") {
        const commit = new GitCommit();

        if (type === "local") {
            const tempFiles = await this.getTempStorageFile();
            if (!tempFiles.length) throw new Error("当前暂存区无可撤回的文件~");

            const files = (await this.#inquirer.handler(
                qsForResetStorageFile(tempFiles)
            )) as Array<string>;
            await commit.resetTempStorageFile(files);
        } else {
            await commit.resetFileToCommit();
        }
    }

    /**
     * 确认tag版本
     * **/
    public async confirmTagVersion(): Promise<string> {
        const cwd = await searchCwdPath(".git");
        const pg = resolve(cwd, "package.json");

        const res = await import(pg);
        return res.version;
    }
}
