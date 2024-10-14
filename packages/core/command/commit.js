const { Inquirer, GitStorage } = require("@mv-cli/modules");
const { basicCommon } = require("@mv-cli/common");

const {
    commitType,
    commitFiles,
    inputCommitFiles,
    chooseCommitOrigin,
    commitMessage,
    commitAction,
} = require("../constance/question");
const { CommitTypeDict } = require("../constance/commandConfig");

class Commit extends Inquirer {
    #gitStorage;
    #config = {
        type: "",
        file: "",
        branch: "",
        message: "",
        origin: "",
    };

    async start(source) {
        await this.chooseType(source);
        await this.chooseCommitFile(source);
        this.chooseCommitBranch(source).then(async (config) => {
            if (!basicCommon.isType(config, "object")) {
                return console.log("提交失败，请重试!");
            }
            const { type, file, origin, branch, message } = config;
            const confirm = await this.handler(commitAction(config));
            if (!confirm) return;

            this.#gitStorage.addFile(file);
            this.#gitStorage.commit(`${type}: ${message}`);
            this.#gitStorage.push(origin, branch);
        });
    }

    async chooseType({ type }) {
        let message = null;
        if (type) {
            const typeExists = Object.keys(CommitTypeDict).includes(
                type.toLocaleLowerCase(),
            );
            if (typeExists) return (this.#config.type = type);
            else
                message = `本次输入的提交类型 ${type} 不合法，请重新选择本地代码的提交类型`;
        }
        this.#config.type = await this.handler(
            commitType(
                message,
                Object.entries(CommitTypeDict).map(([key, value]) => ({
                    name: `${key}: ${value}`,
                    value: key,
                })),
            ),
        );
    }

    async chooseCommitFile({ file }) {
        if (Array.isArray(file) && file?.length)
            return (this.#config.file = file.join(" "));

        const fileType = await this.handler(commitFiles());
        if (fileType === "all") return (this.#config.file = ".");
        this.#config.file = await this.inputCommitFiles();
    }

    chooseCommitBranch({ branch, origin, message }) {
        return new Promise((resolve) => {
            this.#gitStorage = new GitStorage(process.cwd());
            this.#gitStorage.once("load:origin:end", async (originList) => {
                if (!originList || !originList.length)
                    return console.log("当前地址不存在提交源，请创建后重试!");

                if (!origin || !originList.includes(origin)) {
                    if (originList.length > 1) {
                        origin = await this.handler(
                            chooseCommitOrigin(
                                origin && "当前指定的源不存在，请重新选择源:",
                                originList.map((item) => ({
                                    name: `${item.origin}  ${item.remote}`,
                                    value: item.origin,
                                })),
                            ),
                        );
                    } else {
                        origin = originList.at(0).origin;
                    }
                }

                if (!branch) {
                    const branchList =
                        await this.#gitStorage.getBranchRemote(origin);
                    branch = await this.#gitStorage.getCurrentBranch();
                    if (!branchList.length || !branch)
                        return console.log(
                            "当前项目源还未创建分支，请创建后重试!",
                        );
                }

                this.#config.origin = origin;
                this.#config.branch = branch;
                if (message) this.#config.message = message;
                else this.#config.message = await this.commitMessage();

                resolve(this.#config);
            });
        });
    }

    async commitMessage() {
        const value = await this.handler(commitMessage());
        if (!value) return this.commitMessage();
        return value;
    }

    async inputCommitFiles() {
        const files = await this.handler(inputCommitFiles());
        const filesList = files.split(" ").filter((item) => item?.trim?.());
        if (filesList?.length) {
            console.log(
                `本次提交的文件为: ${filesList.join("、").replace("*", "全部未追踪文件")}`,
            );
            return filesList.join(" ").replace("*", ".");
        }
        console.log("输入的本次提交文件不合法，请重新输入");
        return this.inputCommitFiles();
    }
}

module.exports = new Commit();
