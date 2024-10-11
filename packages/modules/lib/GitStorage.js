const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { basicCommon, fileAction } = require("@mv-cli/common");

class GitStorage extends EventEmitter {
    #config = {
        source: "", // git 地址
        local: "", // git 拉取的本地路径
        storagePath: "", // git 拉取的本地项目路径
        storageName: "", // git 拉取仓库的名称
        branch: "", // git 拉取的分支
        isInitPull: false, // 是否在初始化时，拉取一下仓库的代码
        init: false, //仓库是否初始化过
    };
    constructor({ source, local, branch, isInitPull = true }) {
        super();
        if (!source || !local)
            throw new Error("缺少必要的远端仓库地址以及本地映射地址...");

        this.#config.source = source;
        this.#config.local = local;
        this.#config.branch = branch || "master";
        this.#config.isInitPull = isInitPull;
        this.invalid(async () => {
            basicCommon.createNotExistsFolder(this.#config.local);
            await this.load();
            this.#config.init = true;
        });
    }
    get storageName() {
        return this.#config.storageName;
    }
    get storagePath() {
        return this.#config.storagePath;
    }
    get remote() {
        return this.#config.source;
    }
    invalidGitPath(gitPath) {
        return /\.git$/.test(gitPath);
    }
    parseGitRemoteName = (link) => {
        let gitName = link
            .split("/")
            .filter((item) => item)
            .at(-1);
        if (!gitName) return;
        return gitName.replace(".git", "");
    };
    hasGit() {
        return basicCommon.getExecCommandResult("git -v");
    }
    async invalid(cb) {
        if (!this.invalidGitPath(this.#config.source))
            throw new Error("Git 地址无效，请使用有效的地址");
        if (!(await this.hasGit()))
            throw new Error("当先系统还未安装Git，请安装Git地址后重试");
        cb();
    }
    async load() {
        this.#config.storageName = this.parseGitRemoteName(this.remote);
        this.#config.storagePath = path.resolve(
            this.#config.local,
            this.#config.storageName,
        );
        if (fs.existsSync(this.storagePath)) await this.diff();
        else await this.clone();
        this.emit("loadEnd");
    }
    async diff() {
        const activeGitStorage = fileAction.isActiveEmptyGitProject(
            this.storagePath,
        );
        if (!activeGitStorage) {
            this.dropStorage();
            await this.clone();
        } else {
            const { init, isInitPull } = this.#config;
            if (!init && !isInitPull) return;
            await this.pull();
        }
    }
    dropStorage() {
        basicCommon.deleteFolder(this.storagePath);
    }
    async clone() {
        await basicCommon.execCommandPro(`git clone ${this.remote}`, {
            cwd: this.#config.local,
            stdio: "inherit",
        });

        if (!fileAction.isActiveEmptyGitProject(this.storagePath))
            throw new Error(
                "Git 仓库拉取失败, 请检查当前网络以及Git链接地址后重试!",
                this.remote,
            );
    }
    checkout(branch) {
        return this.pull(branch);
    }
    async pull(branch) {
        if (!branch) branch = this.#config.branch;
        const command =
            branch === -1
                ? `git pull`
                : `git fetch --all && git checkout -f ${branch} && git reset origin/${branch} --hard && git pull`;
        await basicCommon.execCommandPro(command, {
            cwd: this.storagePath,
            stdio: "inherit",
        });
    }
    async getCurrentBranch() {
        const branch = await basicCommon.getExecCommandResult(
            "git branch --show-current",
            { cwd: this.#config.storagePath },
        );
        return (branch && branch.replaceAll("\n", "")) || "";
    }
    async getBranchRemote() {
        const branchResult = await basicCommon.getExecCommandResult(
            "git fetch --all && git branch -r",
            { cwd: this.#config.storagePath },
        );
        if (!branchResult) return [];

        return branchResult
            .split("\n")
            .map((item) => {
                if (!item) return;
                if (item.startsWith("origin/HEAD ->")) return;
                const origin = item.split("/")?.[0] || "";
                return item.replace(`${origin}/`, "").trim();
            })
            .filter((item) => item);
    }
}

module.exports = GitStorage;
