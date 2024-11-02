const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { basicCommon, platform } = require("@mvanner/common");

class GitStorage extends EventEmitter {
    #config = {
        source: "", // git 地址
        local: "", // git 拉取的本地路径
        storagePath: "", // git 拉取的本地路径的项目路径
        storageName: "", // git 拉取仓库的名称
        branch: "", // git 拉取的分支
        isInitPull: false, // 是否在初始化时，拉取一下仓库的代码
        init: false, //仓库是否初始化过
    };
    constructor(option) {
        super();
        this.hasGit()
            .then(() => {
                if (basicCommon.isType(option, "string")) {
                    return this.initLocalStorage(option);
                }

                const { source, local, branch, isInitPull = true } = option;
                this.#config.source = source;
                this.#config.local = local;
                this.#config.branch = branch || "master";
                this.#config.isInitPull = isInitPull;
                this.invalid(async () => {
                    basicCommon.createNotExistsFolder(this.#config.local);
                    await this.load();
                    this.#config.init = true;
                });
            })
            .catch(() => {
                console.log("当先系统还未安装Git，请安装Git地址后重试");
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
    async initLocalStorage(localPath) {
        try {
            this.#config.storagePath = localPath;
            const originList = await this.getOriginList();
            if (!originList.length)
                throw new Error("当前项目暂Git源，初始化失败");
            this.emit("load:origin:end", originList);
        } catch (e) {
            console.log("操作失败。", e.message);
        }
    }
    async getOriginList() {
        const source = await basicCommon.getExecCommandResult("git remote -v", {
            cwd: this.storagePath,
            stdio: "pipe",
        });
        let pushOriginList = source
            .split("\n")
            .filter((item) => item && item.endsWith("(push)"));
        pushOriginList = pushOriginList.map((item) => {
            const [origin, remote] = item.split("\t").filter((item) => item);
            const [remoteUrl] = remote.split(" ").filter((item) => item);
            return { origin, remote: remoteUrl };
        });
        return pushOriginList;
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
        const { source, local } = this.#config;
        if (!source || !local)
            return console.log("缺少必要的远端仓库地址以及本地映射地址...");

        if (!this.invalidGitPath(this.#config.source))
            return console.log("Git 地址无效，请使用有效的地址");
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
        this.emit("load:end");
    }
    async diff() {
        const activeGitStorage = platform.isActiveEmptyGitProject(
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

        if (!platform.isActiveEmptyGitProject(this.storagePath))
            throw new Error(
                "Git 仓库拉取失败, 请检查当前网络以及Git链接地址后重试!",
                this.remote,
            );
    }
    checkout(branch, force = false) {
        if (force) return this.pull(branch);
        return basicCommon.execCommandPro(`git checkout ${branch}`, {
            cwd: this.storagePath,
            stdio: "inherit",
        });
    }
    addFile(file) {
        return basicCommon.execCommandPro(`git add ${file}`, {
            cwd: this.storagePath,
            stdio: "inherit",
        });
    }
    commit(message) {
        return basicCommon.execCommandPro(`git commit -m "${message}"`, {
            cwd: this.storagePath,
            stdio: "inherit",
        });
    }
    push(origin, branch, option = {}) {
        if (!origin || !branch) throw new Error("push remote have to origin");
        return basicCommon.execCommandPro(
            `git push ${origin} ${branch}`,
            option,
        );
    }
    async diffFile() {
        const diffString = await basicCommon.getExecCommandResult(
            "git status -s",
            { stdio: ["ignore", "pipe", "ignore"] },
        );
        const result = diffString
            .split("\n")
            .filter((item) => item)
            .map((item) => {
                const trimStr = item.trim();
                return trimStr.slice(trimStr.indexOf(" ") + 1);
            });
        return result;
    }
    async status() {
        const fileString =
            await basicCommon.getExecCommandResult("git status --short");
        return fileString
            .split("\n")
            .map((item) => item.replace("M  ", ""))
            .filter((item) => item);
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
    async getBranchRemote(origin = "") {
        const branchResult = await basicCommon.getExecCommandResult(
            "git fetch --all && git branch -r",
            { cwd: this.#config.storagePath },
        );
        if (!branchResult) return [];
        return branchResult
            .split("\n")
            .map((item) => {
                item = item.trim();
                if (!item) return;
                if (!origin) origin = item.split("/")?.[0] || "";
                if (
                    item.startsWith(`${origin}/HEAD ->`) ||
                    !item.startsWith(`${origin}/`)
                )
                    return;

                return item.replace(`${origin}/`, "");
            })
            .filter((item) => item);
    }
    async getBranchLocal() {
        const branchList = await basicCommon.getExecCommandResult(
            "git branch",
            {
                stdio: ["ignore", "pipe", "ignore"],
            },
        );
        return branchList
            .split("\n")
            .map((item) => item.replace("* ", "").trim());
    }
    async getBranchLocalAndRemoteList() {
        const remoteBranch = await this.getBranchRemote();
        const localBranch = await this.getBranchLocal();
        return basicCommon.unionArrayList(remoteBranch, localBranch);
    }
    async getBranch() {
        const branchList = await basicCommon.getExecCommandResult(
            `git branch -a`,
            {
                stdio: ["ignore", "pipe", "ignore"],
            },
        );
        return branchList
            .split("\n")
            .map((item) => item.replace("* ", "").trim());
    }
    async delBranch(branchList, syncRemote = false, origin = "origin") {
        const branchListContent = branchList.join(" ");
        let delRemoteBranch = [];
        if (syncRemote) {
            const remoteBranchList = await this.getBranchRemote();
            if (remoteBranchList.length) {
                for (const item of remoteBranchList) {
                    if (branchList.includes(item)) delRemoteBranch.push(item);
                }
            }
        }
        await basicCommon.execCommandPro(
            `git branch --delete ${branchListContent} ${syncRemote && delRemoteBranch.length ? `&& git push ${origin} --delete ${delRemoteBranch.join(" ")}` : ""}`,
            { stdio: "inherit" },
        );
    }
    async getCommitNotPushFileList() {
        const conteString = await basicCommon.getExecCommandResult(
            `git log --branches --not --remotes --name-only`,
            { stdio: ["ignore", "pipe", "ignore"] },
        );
        const list = conteString.split("\n").reverse();
        if (!list.length || !list.at(0)) return [];
        const fileList = [];
        for (const item of list) {
            if (item.trim()) fileList.push(item);
            else return fileList;
        }
    }
    async getNotCommitFile() {
        const diffFile = await this.diffFile();
        if (diffFile.length) return diffFile;
        return await this.status();
    }

    async getGitUserName() {
        const username = await basicCommon.getExecCommandResult(
            "git config user.name",
            {
                cwd: this.#config.storagePath,
            },
        );
        if (username.trim() && !["null", "undefined", "NaN"].includes(username))
            return username.slice(0, 10);
        return false;
    }

    async setUserName(username) {
        return await basicCommon.execCommandPro(
            `git config user.name ${username}`,
            { stdio: "inherit" },
        );
    }

    async checkoutOnBasicOfOriginBranch(origin, branchName, basicOfBranch) {
        return await basicCommon.execCommandPro(
            `git checkout -b ${branchName} ${origin}/${basicOfBranch}`,
            { stdio: "inherit" },
        );
    }

    async checkoutOnBasicOfLocalBranch(branchName, basicOfBranch) {
        return await basicCommon.execCommandPro(
            `git checkout -b ${branchName} ${basicOfBranch}`,
            { stdio: "inherit" },
        );
    }

    async getNowBranchName() {
        return await basicCommon.getExecCommandResult(
            `git rev-parse --abbrev-ref HEAD`,
            { stdio: ["ignore", "pipe", "ignore"] },
        );
    }
}

module.exports = GitStorage;
