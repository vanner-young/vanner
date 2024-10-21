const { Inquirer, GitStorage } = require("@mvanner/modules");
const { CommitTypeDict } = require("../constance/commandConfig");
const { delay } = require("@mvanner/common");

const {
    chooseCommitOrigin,
    alreadyStatusFileCheckout,
    chooseOperateType,
    operateTypeOrder,
} = require("../constance/question");
const Commit = require("./commit");

class Checkout extends Inquirer {
    #config = {
        type: "",
        order: "",
        origin: "",
        targetBranch: "",
    };
    #gitStorage;
    get commitType() {
        return Object.keys(CommitTypeDict);
    }
    start(typeName) {
        this.chooseOption(typeName).then(() => {
            console.log(this.#config);
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

                const notPushFile =
                    await this.#gitStorage.isExistsNotCommitFile();
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

                this.#config.order = await this.handler(operateTypeOrder());

                resolve(true);
            });
        });
    }
    chooseBranchType() {
        console.log("切换类型未指定, 选择切换分支类型...");
    }
}

module.exports = new Checkout();
