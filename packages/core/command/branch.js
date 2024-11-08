const { Inquirer, GitStorage } = require("@mvanner/modules");
const { CommitTypeDict } = require("../constance/commandConfig");
const { delay, basicCommon } = require("@mvanner/common");
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
} = require("../constance/question");
const Push = require("./push");

class Branch extends Inquirer {
    #origin = "";
    #addConfig = {
        type: "",
        username: "",
        targetBranch: "",
        newBranchName: "",
    };
    #gitStorage;
    #delBranchSecure = {
        open: true,
        notDelBranch: ["master"],
    };
    get commitType() {
        return Object.keys(CommitTypeDict);
    }
    start(type, ...args) {
        const typeHandler = new Map([
            ["list", this.listBranch],
            ["add", this.addBranch],
            ["del", this.deleteBranch],
            ["status", this.statusCurrentBranch],
        ]);
        if (typeHandler.has(type)) {
            this.#delBranchSecure.open = !!Config.getConfig("branch_secure");
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
        console.log(`项目分支列表如下：(本地/远程)\n${list.join("\n")}`);
    }
    addBranch(branchName, option) {
        this.#addConfig.type = option.type;
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
                    chooseOperateType(CommitTypeDict, type),
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
    async handlerNotPushFile() {
        const notPushFile = await this.#gitStorage.getNotCommitFile();
        if (notPushFile.length) {
            const commitPush = await this.handler(
                alreadyStatusFileCheckout(notPushFile),
            );
            if (!commitPush) process.exit(0);
            await Push.start();
            await delay();
            console.log("暂存区代码提交完成！\n");
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

        const { open, notDelBranch } = this.#delBranchSecure;
        if (open) {
            const notDelBranchList = branch.filter((item) =>
                notDelBranch.includes(item.toLocaleLowerCase()),
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
                        `${notDelBranchList.join("、")} 分支不可删除`,
                    );
                }
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
            await this.#gitStorage.getCommitNotPushFileList();
        const notCommitFile = await this.#gitStorage.getNotCommitFile();
        console.log("暂存区的文件有：");
        console.log(commitNotPushFile.join("\n"));
        console.log("还未提交的文件有：");
        console.log(notCommitFile.join("\n"));
    }
}

module.exports = new Branch();
