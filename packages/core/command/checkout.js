const { Inquirer, GitStorage } = require("@mvanner/modules");
const { CommitTypeDict } = require("../constance/commandConfig");
const { delay } = require("@mvanner/common");

const {
    chooseCommitOrigin,
    alreadyStatusFileCheckout,
    chooseOperateType,
    operateTypeOrder,
    chooseTargetBranch,
    inputGitUserName,
} = require("../constance/question");
const Commit = require("./commit");

class Checkout extends Inquirer {
    #config = {
        type: "",
        order: "",
        origin: "",
        targetBranch: "",
        username: "",
    };
    #gitStorage;
    get commitType() {
        return Object.keys(CommitTypeDict);
    }
    start(typeName) {
        this.chooseOption(typeName).then(async () => {
            const { type, order, origin, username, targetBranch } =
                this.#config;
            await this.#gitStorage.checkoutOnBasicOfOriginBranch(
                origin,
                `${type}/${username}/${order}`,
                targetBranch,
            );
        });
    }
    chooseOption(typeName) {
        return new Promise((resolve) => {
            this.#gitStorage = new GitStorage(process.cwd());
            this.#gitStorage.once("load:origin:end", async (originList) => {
                if (!originList || !originList.length)
                    return console.log("当前地址不存在提交源，请创建后重试!");
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

                const branchList = await this.#gitStorage.getBranchRemote(
                    this.#config.origin,
                );
                if (!branchList.length)
                    return console.log("当前项目源还未创建分支，请创建后重试!");

                const notPushFile = await this.#gitStorage.getNotCommitFile();
                if (notPushFile.length) {
                    const commitPush = await this.handler(
                        alreadyStatusFileCheckout(notPushFile),
                    );
                    if (!commitPush) return;
                    await Commit.start();
                    await delay();
                    console.log("暂存区代码提交完成！\n");
                }

                if (typeName) {
                    if (this.commitType.includes(typeName)) {
                        this.#config.type = typeName;
                    } else {
                        return console.log("当前输入类型不合法，请重新输入！");
                    }
                } else {
                    this.#config.type = await this.handler(
                        chooseOperateType(CommitTypeDict),
                    );
                }
                this.#config.targetBranch = await this.handler(
                    chooseTargetBranch(branchList),
                );
                this.#config.order = await this.handler(operateTypeOrder());
                let username = await this.#gitStorage.getGitUserName();
                console.log(username, typeof username);
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
