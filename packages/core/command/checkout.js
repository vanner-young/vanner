const { delay } = require("@vanner/common");
const Inquirer = require("@vanner/inquirer");
const GitStorage = require("@vanner/gitStorage");
const { commitTypeDict } = require("../constance");

const {
    chooseCommitOrigin,
    checkoutBranchName,
    alreadyStatusFileCheckout,
} = require("../constance/question");
const Push = require("./push");

class Checkout extends Inquirer {
    #config = {
        origin: "",
        targetBranch: "",
    };
    #gitStorage;
    get commitType() {
        return Object.keys(commitTypeDict);
    }
    start(branchName) {
        this.#config.targetBranch = branchName;
        this.chooseOption().then(async () => {
            const { targetBranch } = this.#config;
            this.#gitStorage.checkout(targetBranch);
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
        const localBranchList = await this.#gitStorage.getBranchLocal();
        const remoteBranchList = await this.#gitStorage.getBranchRemote(
            this.#config.origin,
        );
        if (![...localBranchList, ...remoteBranchList].length) {
            throw new Error("当前项目源还未创建分支，请创建后重试!");
        }
        return { remote: remoteBranchList, local: localBranchList };
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
                const { remote, local } = await this.invalidBranch();
                const currentBranch = await this.#gitStorage.getCurrentBranch();
                await this.handlerNotPushFile();

                if (!this.#config.targetBranch) {
                    this.#config.targetBranch = await this.handler(
                        checkoutBranchName(
                            local
                                .map((item) => {
                                    return {
                                        label: `${item}${item === currentBranch ? "(当前分支)" : ""}`,
                                        value: item,
                                    };
                                })
                                .concat(
                                    remote.map((item) => {
                                        return {
                                            label: `remote/${this.#config.origin}/${item}`,
                                            value: item,
                                        };
                                    }),
                                ),
                        ),
                    );
                }
                return resolve(this.#config);
            });
        });
    }
}

module.exports = new Checkout();
