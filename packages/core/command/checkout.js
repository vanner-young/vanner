const { delay } = require("@mvanners/common");
const Inquirer = require("@mvanners/inquirer");
const GitStorage = require("@mvanners/gitStorage");
const { CommitTypeDict } = require("../constance/commandConfig");

const {
    chooseCommitOrigin,
    alreadyStatusFileCheckout,
    chooseOperateType,
    inputCheckoutBranchName,
    chooseTargetBranch,
    inputGitUserName,
} = require("../constance/question");
const Push = require("./push");

class Checkout extends Inquirer {
    #config = {
        origin: "",
        branch: "",
        type: "",
        targetBranch: "",
        username: "",
    };
    #gitStorage;
    get commitType() {
        return Object.keys(CommitTypeDict);
    }
    start(branchName, source) {
        this.#config.type = source.type;
        this.#config.branch = branchName;

        this.chooseOption().then(async () => {
            const { type, origin, branch, username, targetBranch } =
                this.#config;

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
            this.#config.origin = await this.handler(
                chooseCommitOrigin(
                    originList.map((item) => ({
                        name: `${item.origin}  ${item.remote}`,
                        value: item.origin,
                    })),
                ),
            );
        } else {
            this.#config.origin = originList.at(0).origin;
        }
    }
    async invalidBranch() {
        const branchList = await this.#gitStorage.getBranchRemote(
            this.#config.origin,
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
    chooseOption() {
        return new Promise((resolve) => {
            this.#gitStorage = new GitStorage(process.cwd());
            this.#gitStorage.once("load:origin:end", async (originList) => {
                await this.confirmOrigin(originList);
                const branchList = await this.invalidBranch();
                await this.handlerNotPushFile();

                const { branch, type } = this.#config;
                if (!branch) {
                    this.#config.branch = await this.handler(
                        inputCheckoutBranchName(),
                    );
                }

                if (!type || !this.commitType.includes(type)) {
                    this.#config.type = await this.handler(
                        chooseOperateType(CommitTypeDict, type),
                    );
                }

                const nowBranchName = await this.#gitStorage.getNowBranchName();
                this.#config.targetBranch = await this.handler(
                    chooseTargetBranch(branchList, nowBranchName),
                );

                let username = await this.#gitStorage.getGitUserName();
                if (!username) {
                    username = await this.handler(inputGitUserName());
                    await this.#gitStorage.setUserName(username);
                }
                this.#config.username = username;

                resolve(this.#config);
            });
        });
    }
}

module.exports = new Checkout();
