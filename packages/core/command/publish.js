const fs = require("fs");
const path = require("path");
const Version = require("./version");
const Inquirer = require("@vanner/inquirer");
const GitStorage = require("@vanner/gitStorage");
const { platform, basicCommon } = require("@vanner/common");

const Push = require("./push");
const Config = require("./config");
const {
    chooseCommitOrigin,
    confirmEmptyPublish,
} = require("../constance/question");

class Publish extends Inquirer {
    #gitStorage = null;
    #origin = null;
    #cwd = null;
    #version = null;
    #config = {};
    #branchName = null;
    afterExecFileName = "vanner.publish.js";

    async start(source) {
        this.#config = source;
        this.#branchName = Config.getConfigResult("default_main_branch_name");
        this.verify().then(async () => {
            const publish = await this.handlerBranchPush();
            if (!publish) return;

            await this.createTag();
            await this.publishNpm();
            console.log("vanner: publish is successfully...");
        });
    }
    verify() {
        return new Promise(async (resolve) => {
            this.#cwd = await platform.findProjectParentExecCwd();
            if (!this.#cwd)
                throw new Error(
                    "当前路径及其父级不存在可执行的项目，请切换后重试！",
                );

            this.#gitStorage = new GitStorage(this.#cwd);
            this.#gitStorage.once("load:origin:end", async (originList) => {
                await this.confirmOrigin(originList);
                const branchList =
                    await this.#gitStorage.getBranchLocalAndRemoteList(
                        this.#origin,
                    );
                if (!branchList.includes(this.#branchName))
                    throw new Error(
                        `当前项目中不存在 ${this.#branchName} 主分支，请创建后重试！`,
                    );

                const nowBranch = await this.#gitStorage.getCurrentBranch();
                if (nowBranch !== this.#branchName)
                    throw new Error(
                        `请切换至 ${this.#branchName} 主分支后执行此命令！`,
                    );

                resolve(branchList);
            });
        });
    }
    async createTag() {
        const result = await basicCommon.execCommand(
            `git tag --list ${this.#version}`,
            {
                cwd: this.#cwd,
            },
        );
        if (!result.trim()) {
            await this.#gitStorage.sendTag(
                this.#origin,
                this.#version,
                `发布${this.#origin}版本`,
            );
        }
    }
    async publishNpm() {
        if (this.#config.npm || Config.getConfigResult("default_publish_npm")) {
            await basicCommon.execCommand("npm publish", {
                cwd: this.#cwd,
                stdio: "inherit",
            });
        }
        const vannerFilePath = path.resolve(this.#cwd, this.afterExecFileName);
        if (!fs.existsSync(vannerFilePath)) return;
        await basicCommon.execCommand(`node ${this.afterExecFileName}`, {
            cwd: this.#cwd,
            stdio: "inherit",
        });
        console.log("vanner: publish successfully！");
    }
    async pushPackageJson() {
        await Push.start({
            type: "fix",
            origin: this.#origin,
            branch: this.#branchName,
            message: `迭代 ${this.#version} 版本号`,
            file: ["package.json"],
            pushOrigin: true,
        });
    }
    async handlerBranchPush() {
        let publish = true;
        const notPushFile = await this.#gitStorage.getCommitNotPushFileList();
        const notCommitFile = await this.#gitStorage.getNotCommitFile();
        const fileList = [...notPushFile, ...notCommitFile];
        if (!fileList.length)
            publish = await this.handler(confirmEmptyPublish());
        if (!publish) return;

        this.#version = await Version.start();
        await this.pushPackageJson();
        if (fileList.length) {
            console.log(
                "当前项目中存在未提交的文件，请提交后在根据指引发布版本！\n",
            );
            await Push.start({
                branch: this.#branchName,
                origin: this.#origin,
            });
        }
        return true;
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
}

module.exports = new Publish();
