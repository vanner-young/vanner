import { resolve } from "node:path";
import { Inquirer, GitRemote, Git, GitCommit } from "@vanner/module";
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
import { Config } from "@core/module/config";
import { execCommand } from "mv-common";

export class PjGit extends Git {
    #inquirer: Inquirer;

    constructor() {
        super();
        this.#inquirer = new Inquirer();
    }

    /**
     * 确认git环境, 当不存在时，指引其初始化
     * @param { boolean } tipsInit 当git仓库不存在时，是否提示其init
     * **/
    async confirmGitEnv(tipsInit: boolean = true) {
        const git = getRuntimeFlag(RuntimeFlag.git);
        if (!Number(git))
            throw new Error(
                "当前系统未存在git，请根据此链接进行安装后重试：https://git-scm.com"
            );
        const hasGit = await this.env();

        if (!tipsInit) return hasGit;
        if (!hasGit) {
            const init = await this.#inquirer.handler(qsForAskInitStorage());
            if (init) await this.initGit();
            throw new Error(IgnoreFlag);
        }
    }

    /**
     * 确认操作仓库的远程地址，未存在则输入一个远程地址
     * **/
    async confirmGitRemote(): Promise<string> {
        let remote = "";
        const remoteList = await this.remote(); // 获取项目源地址

        if (remoteList.length <= 0) {
            const { name, url } = await this.confirmRemoteInfo();
            await GitRemote.addRemote(name, url as string);
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
     * 选择一个已存在的远程仓库地址
     * **/
    async chooseStorageSingleRemote() {
        const remotes = await this.remote();
        if (!remotes.length) throw new Error("当前仓库暂无远程地址~");

        return await this.#inquirer.handler(
            qsForChooseRemote(remotes.map((it) => it.origin as string))
        );
    }

    /**
     * 确认操作仓库的分支名称(currentBranch 会在即使仓库没有分支的情况下，仍存在默认的main|master分支)
     * **/
    async confirmBranch(): Promise<string | void> {
        const branch = await this.currentBranch();
        if (branch) return branch;

        throw new Error("当前所在分支为空，请切换分支后重试~");
    }

    /**
     * 确认本地提交的文件
     * **/
    async confirmLocalCommitFile(): Promise<Array<string>> {
        let dfFile = await this.getWorkspaceFile(); // 获取还未提交至本地的文件
        return dfFile.length
            ? await this.#inquirer.handler(qsForTempStorageFile(dfFile))
            : dfFile;
    }

    /**
     * 确认本次需要提交的文件
     * **/
    async confirmPushFile(): Promise<{
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
    async confirmPushType(): Promise<{
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
    async rewriteMsg() {
        const { type, msg } = await this.confirmPushType();
        await new GitCommit().rewriteCommitMsg(type, msg);
        this.showGitLog();
    }

    /**
     * 撤销暂存区或本地的提交(仍保留修改内容)
     * @param { string } type workspace: 暂存区撤回、commit: 本地提交撤回
     * **/
    async resetTempOrCommitAction(type: "workspace" | "commit") {
        const commit = new GitCommit();

        if (type === "workspace") {
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
    async confirmTagVersion(): Promise<string> {
        const config = new Config();
        const tagSecurity = config.get("tag_security");
        if (tagSecurity) {
            const currentBranch = await this.currentBranch();
            const mainBranch: Array<string> = config
                .get("main_branch")
                .split("/");

            if (!mainBranch.includes(currentBranch)) {
                throw new Error("当前仓库分支不属于主分支，无法发布tag版本~");
            }
        }

        const cwd = await searchCwdPath(".git");
        const pg = resolve(cwd, "package.json");
        const res = await import(pg);
        return res.version;
    }

    /**
     * 发布 tag 至 release
     * **/
    async releaseTag(remote = "", tag = "") {
        if (!remote) remote = await this.confirmGitRemote();
        if (!tag) tag = await this.confirmTagVersion();

        await new GitCommit().releaseTag({ remote, tag });
    }

    /**
     * 查看当前仓库的tag列表
     * @param { boolean } output 是否格式化打印版本号
     * **/
    async tags(output: boolean = false) {
        const tags = await new GitCommit().tags();
        if (output) console.log(tags.join("\n"));
        return tags;
    }

    /**
     * 确认需要添加仓库的远程信息
     * **/
    async confirmRemoteInfo() {
        const originRemote = (await this.#inquirer.handler(
            qsForAddStorageRemote()
        )) as string;

        const [name, url] = originRemote.split(" ");
        if (!name?.trim() || !url?.trim() || !isValidGitUrl(url as string)) {
            throw new Error("远程地址名称或地址无效，请重试！");
        }

        return { name, url };
    }
}
