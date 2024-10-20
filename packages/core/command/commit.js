const { Inquirer, GitStorage } = require("@mv-cli/modules");
const { basicCommon, platform } = require("@mv-cli/common");

const {
    commitType,
    chooseCommitOrigin,
    commitMessage,
    commitAction,
    chooseCommitFile,
    alreadyStatusFile,
    alreadyCommitFile,
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
        push: false,
    };
    diffFile = [];
    statusFile = [];

    async start(source) {
        this.#gitStorage = new GitStorage(process.cwd());

        this.chooseOption(source).then(async (config) => {
            if (!basicCommon.isType(config, "object")) {
                return console.log("提交失败，请重试!");
            }
            const { type, file, origin, branch, message, push } = config;
            if (!push) {
                const confirm = await this.handler(
                    commitAction({
                        ...config,
                        file: `\n${file
                            .split(" ")
                            .map((item, index) => ` ${index + 1}. ${item}`)
                            .join("\n")}`,
                        message: message
                            .split(";")
                            .filter((item) => item.trim())
                            .join("\n"),
                    }),
                );
                if (!confirm) return;
                this.#gitStorage.addFile(file);
                this.#gitStorage.commit(`${type}: ${message}`);
            }
            this.#gitStorage.push(origin, branch);
        });
    }

    async chooseType({ type }) {
        if (type) {
            const typeExists = Object.keys(CommitTypeDict).includes(
                type.toLocaleLowerCase(),
            );
            if (typeExists) return (this.#config.type = type);
        }
        this.#config.type = await this.handler(
            commitType(
                type &&
                    `本次输入的提交类型 ${type} 不合法，请重新选择本地代码的提交类型`,
                Object.entries(CommitTypeDict).map(([key, value]) => ({
                    name: `${key}: ${value}`,
                    value: key,
                })),
                platform.getProcessEnv("default_commit_type"),
            ),
        );
    }

    async chooseCommitFile({ file }) {
        if (Array.isArray(file) && file?.length)
            return (this.#config.file = file.join(" "));

        if (this.diffFile.length) {
            const commitFiles = await this.handler(
                chooseCommitFile(this.diffFile),
            );
            this.#config.file = commitFiles.join(" ");
        } else {
            const isReady = await this.handler(
                alreadyStatusFile(this.statusFile),
            );
            if (isReady) this.#config.file = this.statusFile.join(" ");
        }
    }

    chooseOption(source) {
        return new Promise((resolve) => {
            let { branch, origin, message } = source;
            this.#gitStorage.once("load:origin:end", async (originList) => {
                this.diffFile = await this.#gitStorage.diffFile();

                if (!this.diffFile.length) {
                    this.statusFile = await this.#gitStorage.status();
                    if (!this.statusFile.length) {
                        const notPushFile =
                            await this.#gitStorage.getCommitNotPushFileList();
                        if (!notPushFile.length) {
                            return console.log(
                                "当前路径下暂无变更的文件, 无需提交.",
                            );
                        } else {
                            const pushFile = await this.handler(
                                alreadyCommitFile(notPushFile),
                            );
                            if (!pushFile) return;
                            this.#config.push = true;
                        }
                    }
                }

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

                if (!this.#config.push) {
                    await this.chooseType(source);
                    await this.chooseCommitFile(source);
                    if (!this.#config.file.trim()) return;

                    if (message) this.#config.message = message;
                    else this.#config.message = await this.commitMessage();
                }
                resolve(this.#config);
            });
        });
    }

    async commitMessage() {
        const value = await this.handler(commitMessage());
        if (!value) return this.commitMessage();
        return value;
    }
}

module.exports = new Commit();
