const { Inquirer, GitStorage } = require("@mvanner/modules");
const { CommitTypeDict } = require("../constance/commandConfig");
const { delay } = require("@mvanner/common");

const {
    chooseCommitOrigin,
    alreadyStatusFileCheckout,
    chooseOperateType,
    inputCheckoutBranchName,
    chooseTargetBranch,
    inputGitUserName,
} = require("../constance/question");
const Commit = require("./commit");

class Branch extends Inquirer {
    #origin = "";
    #addConfig = {
        branch: "",
        type: "",
        targetBranch: "",
        username: "",
    };
    #gitStorage;
    get commitType() {
        return Object.keys(CommitTypeDict);
    }
    start(type, ...args) {
        const typeHandler = new Map([
            ["add", this.addBranch],
            ["delete", this.deleteBranch],
            ["list", this.listBranch],
        ]);
        if (typeHandler.has(type)) {
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
        console.log(`项目分支列表如下：(远程/本地)\n${list.join("\n")}`);
    }
    addBranch(branchName, option) {
        this.#addConfig.type = option.type;
        this.#addConfig.branch = branchName;

        this.chooseOption().then(async () => {
            const { type, branch, username, targetBranch } = this.#addConfig;

            const newBranchName = `${type}/${username}/${branch}`;
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

            // 均是从当前分支作为基准进行切换
            await this.handlerNotPushFile();

            const { branch, type } = this.#addConfig;
            if (!branch) {
                this.#addConfig.branch = await this.handler(
                    inputCheckoutBranchName(),
                );
            }

            if (!type || !this.commitType.includes(type)) {
                this.#addConfig.type = await this.handler(
                    chooseOperateType(CommitTypeDict, type),
                );
            }

            const nowBranchName = await this.#gitStorage.getNowBranchName();
            this.#addConfig.targetBranch = await this.handler(
                chooseTargetBranch(branchList, nowBranchName),
            );

            let username = await this.#gitStorage.getGitUserName();
            if (!username) {
                username = await this.handler(inputGitUserName());
                await this.#gitStorage.setUserName(username);
            }
            this.#addConfig.username = username;

            resolve(this.#addConfig);
        });
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
            await Commit.start();
            await delay();
            console.log("暂存区代码提交完成！\n");
        }
    }
    deleteBranch() {}
}

module.exports = new Branch();
