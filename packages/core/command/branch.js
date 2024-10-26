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
    #addConfig = {
        branch: "",
        type: "",
        origin: "",
        targetBranch: "",
        username: "",
    };
    #gitStorage;
    start(type, ...args) {
        const typeHandler = new Map([
            ["add", this.addBranch],
            ["delete", this.deleteBranch],
        ]);
        if (typeHandler.has(type)) {
            typeHandler.get(type).call(this, ...args);
        }
    }
    addBranch(branchName, type) {
        this.#addConfig.type = type;
        this.#addConfig.branch = branchName;

        this.chooseOption().then(async () => {
            const { type, origin, branch, username, targetBranch } =
                this.#addConfig;

            const newBranchName = `${type}/${username}/${branch}`;
            const localBranch = await this.#gitStorage.getBranchLocal();
            if (localBranch.includes(targetBranch)) {
                await this.#gitStorage.checkoutOnBasicOfLocalBranch(
                    newBranchName,
                    targetBranch,
                );
            } else {
                await this.#gitStorage.checkoutOnBasicOfOriginBranch(
                    origin,
                    newBranchName,
                    targetBranch,
                );
            }
        });
    }
    async confirmOrigin(originList) {
        if (originList.length > 1) {
            this.#addConfig.origin = await this.handler(
                chooseCommitOrigin(
                    originList.map((item) => ({
                        name: `${item.origin}  ${item.remote}`,
                        value: item.origin,
                    })),
                ),
            );
        } else {
            this.#addConfig.origin = originList.at(0).origin;
        }
    }
    async invalidBranch() {
        const branchList = await this.#gitStorage.getBranchRemote(
            this.#addConfig.origin,
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
    chooseOption() {
        return new Promise((resolve) => {
            this.#gitStorage = new GitStorage(process.cwd());
            this.#gitStorage.once("load:origin:end", async (originList) => {
                await this.confirmOrigin(originList);
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
        });
    }
    deleteBranch() {}
}

module.exports = new Branch();
