const fs = require("fs");
const Inquirer = require("@vanner/inquirer");
const GitStorage = require("@vanner/gitStorage");
const { commitTypeDict } = require("../constance");
const { delay, basicCommon, platform } = require("@vanner/common");
const Config = require("./config");

const {
    chooseCommitOrigin,
    alreadyStatusFileCheckout,
    chooseOperateType,
    inputCheckoutBranchName,
    chooseTargetBranch,
    inputGitUserName,
    delBranchConfirm,
    chooseDelLocalBranch,
    syncDelRemoteBranch,
    notDelBranchConfirm,
    addProjectOriginName,
    addProjectOriginUrl,
    addOriginBranch,
    inputBranchName,
    pushOrigin,
    delOriginList,
    syncRemoteBranch,
    checkoutBranch,
    waningSyncRemoteBranchMerge,
} = require("../constance/question");
const Push = require("./push");

class Branch extends Inquirer {
    #origin = "";
    #gitStorage;
    #addConfig = {
        type: "",
        username: "",
        targetBranch: "",
        newBranchName: "",
    };
    #delBranchSecure = {
        open: true,
        notDelBranch: ["master"],
    };
    #addOriginConfig = {
        name: "",
        address: "",
    };
    get commitType() {
        return Object.keys(commitTypeDict);
    }
    start(type, ...args) {
        const typeHandler = new Map([
            ["list", this.listBranch],
            ["add", this.addBranch],
            ["del", this.deleteBranch],
            ["status", this.statusCurrentBranch],
            ["addOrigin", this.addOrigin],
            ["delOrigin", this.delOrigin],
        ]);
        if (typeHandler.has(type)) {
            const branch_secure = Config.getConfigResult("branch_secure");
            if (branch_secure === undefined)
                throw new Error("invalid branch_secure...");
            this.#delBranchSecure.open = !!branch_secure;
            if (["addOrigin", "delOrigin"].includes(type))
                return typeHandler.get(type).call(this, ...args);
            else
                this.invalid().then(() => {
                    typeHandler.get(type).call(this, ...args);
                });
        }
    }
    invalid() {
        return new Promise((resolve) => {
            this.#gitStorage = new GitStorage(process.cwd());
            this.#gitStorage.once("load:origin:end", async (originList) => {
                return resolve(await this.confirmOrigin(originList));
            });
        });
    }
    async listBranch() {
        const list = await this.#gitStorage.getBranch();
        const { local, remote } = this.distinguishBranchType(list);
        if (!local.length && !remote.length)
            return console.log("当前仓库暂无代码分支");

        if (local.length) console.log(`\n本地分支如下：\n${local.join("\n")}`);
        if (local.length) console.log(`\n远程分支如下：\n${remote.join("\n")}`);
    }
    distinguishBranchType(branchList) {
        return branchList.reduce(
            (pre, next) => {
                if (next.startsWith(`remotes/${this.#origin}/`))
                    pre.remote.push(next);
                else pre.local.push(next);

                return pre;
            },
            { local: [], remote: [] },
        );
    }
    async addOrigin(originName, originAddress, cwdPath = false) {
        return new Promise(async (resolve) => {
            originName = originName?.trim?.();
            originAddress = originAddress?.trim?.();
            this.#addOriginConfig.name =
                originName || (await this.handler(addProjectOriginName()));
            this.#addOriginConfig.address =
                originAddress || (await this.addOriginAddress());
            let projectCwd =
                cwdPath || (await platform.findProjectParentExecCwd());
            if (!fs.existsSync(projectCwd)) projectCwd = process.cwd();

            this.#gitStorage = new GitStorage({
                local: projectCwd,
                storagePath: projectCwd,
                addInitGit: true,
            });
            this.#gitStorage.once("load:origin:end", async () => {
                await this.handlePushLocalFile();
                await this.#gitStorage.addOrigin(this.#addOriginConfig);
                await this.#gitStorage.fetch();
                console.log(
                    `\nGit源 ${this.#addOriginConfig.name} 创建成功！\n`,
                );
                try {
                    const remoteBranch = await this.#gitStorage.getBranchRemote(
                        this.#addOriginConfig.name,
                    );
                    // 提示创建分支
                    if (!remoteBranch.length) {
                        const isAddBranch = await this.handler(
                            addOriginBranch(this.#addOriginConfig.name),
                        );
                        if (isAddBranch) {
                            const branchName =
                                await this.handler(inputBranchName());
                            await this.#gitStorage.createBranch(branchName);

                            const pushBranch = await this.handler(pushOrigin());
                            if (pushBranch) {
                                await this.#gitStorage.push(
                                    this.#addOriginConfig.name,
                                    branchName,
                                );
                            }
                        }
                    } else {
                        const isSyncRemoteBranch = await this.handler(
                            syncRemoteBranch(
                                this.#addOriginConfig.name,
                                remoteBranch,
                            ),
                        );
                        if (isSyncRemoteBranch) {
                            const branchName = await this.handler(
                                checkoutBranch(remoteBranch),
                            );

                            const warningConfirm = await this.handler(
                                waningSyncRemoteBranchMerge(branchName),
                            );

                            if (warningConfirm) {
                                this.#gitStorage.pullRemoteForce(
                                    this.#addOriginConfig.name,
                                    branchName,
                                );
                            }
                        }
                    }
                } catch (e) {
                    console.log(
                        `\nGit源 ${this.#addOriginConfig.name} 创建失败！`,
                        e.message || e,
                    );
                    this.#gitStorage.removeOrigin(this.#addOriginConfig.name);
                }
                return resolve(true);
            });
        });
    }
    async delOrigin() {
        let projectCwd = await platform.findProjectParentExecCwd();
        if (!fs.existsSync(projectCwd)) projectCwd = process.cwd();
        this.#gitStorage = new GitStorage(projectCwd);
        this.#gitStorage.once("load:origin:end", async (originList) => {
            const list = await this.handler(
                delOriginList(originList.map((item) => item.origin)),
            );
            for (const item of list) {
                await this.#gitStorage.removeOrigin(item);
            }
            console.log(
                `Git源 ${list.join("\n")} 累计 ${list.length} 个删除成功！`,
            );
        });
    }
    async handlePushLocalFile() {
        const notPushFile = await this.#gitStorage.getNotCommitFile();
        if (notPushFile.length) {
            console.log("\n当前项目下存在未提交的文件，请下提交至暂存区\n");
            const commitType = await Push.chooseType();
            const commitMessage = await Push.commitMessage();
            await this.#gitStorage.addFile(".");
            await this.#gitStorage.commit(`${commitType}: ${commitMessage}`);
        }
    }
    async addOriginAddress(again = false) {
        const address = await this.handler(addProjectOriginUrl(again));
        if (!platform.isValidGitUrl(address))
            return this.addOriginAddress(true);
        return address;
    }
    addBranch(branchName) {
        this.#addConfig.newBranchName = branchName;

        this.chooseOption().then(async () => {
            const { targetBranch, newBranchName } = this.#addConfig;

            const localBranch = await this.#gitStorage.getBranchLocal();
            if (localBranch.includes(targetBranch)) {
                await this.#gitStorage.checkoutOnBasicOfLocalBranch(
                    newBranchName,
                    targetBranch,
                );
            } else {
                await this.#gitStorage.checkoutOnBasicOfOriginBranch(
                    this.#origin,
                    newBranchName,
                    targetBranch,
                );
            }
            console.log(`\n新增代码分支成功，已切换为新分支：${newBranchName}`);
        });
    }
    chooseOption() {
        return new Promise(async (resolve) => {
            const branchList = await this.invalidBranch();
            await this.handlerNotPushFile();

            let username = await this.#gitStorage.getGitUserName();
            if (!username) {
                username = await this.handler(inputGitUserName());
                await this.#gitStorage.setUserName(username);
            }
            this.#addConfig.username = username;

            const { type } = this.#addConfig;
            if (!type || !this.commitType.includes(type)) {
                this.#addConfig.type = await this.handler(
                    chooseOperateType(commitTypeDict, type),
                );
            }

            this.#addConfig.newBranchName = await this.confirmNewBranchName();

            const nowBranchName = await this.#gitStorage.getNowBranchName();
            this.#addConfig.targetBranch = await this.handler(
                chooseTargetBranch(branchList, nowBranchName),
            );

            resolve(this.#addConfig);
        });
    }
    async confirmNewBranchName(invalid = false) {
        const { type, username } = this.#addConfig;
        let newBranchName = this.#addConfig.newBranchName;
        const branchList = await this.#gitStorage.getBranchLocalAndRemoteList();

        if (!newBranchName) {
            const newBranch = await this.handler(
                inputCheckoutBranchName(
                    invalid
                        ? "分支名称或(需求/Bug/优化)ID已存在，请重新输入："
                        : "请输入分支名称, 推荐使用(需求/Bug/优化/)ID：",
                ),
            );
            newBranchName = `${type}/${username}/${newBranch}`;
        }
        if (branchList.includes(newBranchName)) {
            this.#addConfig.newBranchName = "";
            return this.confirmNewBranchName(true);
        } else {
            return newBranchName;
        }
    }
    async confirmOrigin(originList) {
        if (originList.length > 1) {
            this.#origin = await this.handler(
                chooseCommitOrigin(
                    originList.map((item) => ({
                        name: `${item.origin}  ${item.remote}`,
                        value: item.origin,
                    })),
                ),
            );
        } else {
            this.#origin = originList.at(0).origin;
        }
    }
    async invalidBranch() {
        const branchList = await this.#gitStorage.getBranchLocalAndRemoteList(
            this.#origin,
        );
        if (!branchList.length) {
            throw new Error("当前项目源还未创建分支，请创建后重试!");
        }
        return branchList;
    }
    async handlerNotPushFile(source = {}) {
        const notPushFile = await this.#gitStorage.getNotCommitFile();
        if (notPushFile.length) {
            const commitPush = await this.handler(
                alreadyStatusFileCheckout(notPushFile),
            );
            if (!commitPush) process.exit(0);
            await Push.start(source);
            await delay();
            console.log("代码提交完成！\n");
        }
    }
    deleteBranch(branch) {
        if (branch.length) {
            this.delLocalBranch(branch);
        } else {
            this.chooseDelBranch();
        }
    }
    async chooseDelBranch() {
        const branchList = await this.handler(
            chooseDelLocalBranch(await this.#gitStorage.getBranchLocal()),
        );
        this.delLocalBranch(branchList);
    }
    async delLocalBranch(branch) {
        if (!branch.length) throw new Error("缺少需要删除的分支列表...");

        const currentBranch = await this.#gitStorage.getCurrentBranch();
        const { open, notDelBranch } = this.#delBranchSecure;
        const notDelBranchList = branch.filter(
            (item) =>
                (open && notDelBranch.includes(item.toLocaleLowerCase())) ||
                currentBranch === item,
        );
        if (notDelBranchList.length) {
            const delBranchList = basicCommon.differenceArrayList(
                branch,
                notDelBranchList,
            );
            if (delBranchList.length) {
                const continueStep = await this.handler(
                    notDelBranchConfirm(notDelBranchList),
                );
                if (continueStep) {
                    return this.delLocalBranch(delBranchList);
                }
            } else {
                return console.log(
                    `\n${notDelBranchList.join("、")} 为当前所在分支或保护分支，删除失败。`,
                );
            }
        }

        const branchList = await this.#gitStorage.getBranchLocal();
        const existsBranchList = branch.filter((item) =>
            branchList.includes(item),
        );
        if (!existsBranchList.length) return this.chooseDelBranch();
        const unExistsBranch = basicCommon.differenceArrayList(
            branch,
            existsBranchList,
        );
        const confirmDelBranch = await this.handler(
            delBranchConfirm(
                `本次删除的分支有：${existsBranchList.join(" ")} 确定要继续？${unExistsBranch.length ? `，${unExistsBranch.join(" ")}不存在将忽略` : ""}`,
            ),
        );
        const delRemoteBranch = await this.handler(syncDelRemoteBranch());

        if (confirmDelBranch)
            await this.#gitStorage.delBranch(
                existsBranchList,
                delRemoteBranch,
                this.#origin,
            );
    }
    async statusCurrentBranch() {
        const commitNotPushFile =
                await this.#gitStorage.getCommitNotPushFileList(),
            notCommitFile = await this.#gitStorage.getNotCommitFile();
        if (!commitNotPushFile.length && !notCommitFile.length)
            return console.log("\n当前分支暂无变更的文件");

        if (notCommitFile.length)
            console.log(`\n还未提交的文件有：\n${notCommitFile.join("\n")}`);
        if (commitNotPushFile.length)
            console.log(`\n暂存区的文件有：\n${commitNotPushFile.join("\n")}`);
    }
}

module.exports = new Branch();
