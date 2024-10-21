const { Inquirer, GitStorage } = require("@mvanner/modules");
const { CommitTypeDict } = require("../constance/commandConfig");

const {
    chooseCommitOrigin,
    alreadyStatusFileCheckout,
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
    start(source) {
        this.chooseOption(source).then(() => {
            console.log(this.#config);
        });
    }
    chooseOption() {
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
                }
            });
        });
    }
    chooseBranchType() {
        console.log("切换类型未指定, 选择切换分支类型...");
    }
}

module.exports = new Checkout();
