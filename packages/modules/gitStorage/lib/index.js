const fs = require("fs");
const path = require("path");
const EventEmitter = require("events");
const { basicCommon, platform } = require("@vanner/common");

class GitStorage extends EventEmitter {
    #config = {
        branch: "", // git 拉取的分支
        source: "", // git 地址
        local: "", // git 拉取的本地路径
        storagePath: "", // git 仓库路径
        storageName: "", // git 拉取仓库的名称
        isInitPull: false, // 是否在初始化时，拉取一下仓库的代码
        init: false, //仓库是否初始化过
    };
    get storageName() {
        return this.#config.storageName;
    }
    get storagePath() {
        return this.#config.storagePath;
    }
    get remote() {
        return this.#config.source;
    }
    constructor(option) {
        super();
        this.hasGit()
            .then(() => {
                // 没有git仓库，给项目添加git仓库并新增源
                if (option.addInitGit) {
                    return this.addInitGitProject(option);
                }

                // 已存在git仓库，对仓库进行管理
                if (basicCommon.isType(option, "string")) {
                    return this.initLocalStorage(option);
                }

                // 建立链接，将git仓库与本地路径进行关联同步
                const { source, local, branch, isInitPull = true } = option;
                this.#config.source = source;
                this.#config.local = local;
                this.#config.branch = branch || "master";
                this.#config.isInitPull = isInitPull;
                this.invalid(async () => {
                    basicCommon.createDir(this.#config.local);
                    await this.load();
                    this.#config.init = true;
                });
            })
            .catch((e) => {
                console.log(e.message || e);
            });
    }

    // 初始化git仓库
    async initGitProject() {
        return basicCommon.execCommand("git init", {
            cwd: this.#config.local,
        });
    }

    // 添加一个源
    async addOrigin({ name, address }) {
        if (!name || !address)
            throw new Error("缺少源名称或地址，添加源失败！");
        const originList = (await this.getOriginList()).map(
            (item) => item.origin,
        );
        if (originList.includes(name))
            throw new Error(
                `Git源 ${name} 已存在，添加源失败！${originList.join("、")}`,
            );
        return basicCommon.execCommand(`git remote add ${name} ${address}`, {
            stdio: ["inherit", "inherit", "pipe"],
            cwd: this.#config.local || this.#config.storagePath,
        });
    }

    // 删除一个源
    async removeOrigin(name) {
        if (!name) throw new Error("缺少源名称，删除源失败！");
        return basicCommon.execCommand(`git remote remove ${name}`, {
            stdio: ["inherit", "inherit", "pipe"],
            cwd: this.#config.local || this.#config.storagePath,
        });
    }

    async addInitGitProject(option) {
        if (!option.local) throw new Error("未找到项目路径，git 初始化失败");
        if (!fs.existsSync(option.local))
            throw new Error("项目路径不存在，请重新输入");

        this.#config.local = option.local;
        this.#config.storagePath = option.storagePath;
        const existsGit = platform.isActiveEmptyGitProject(option.local);
        if (!existsGit) await this.initGitProject();
        this.emit("load:origin:end", true);
    }

    async initLocalStorage(targetPath) {
        try {
            this.#config.storagePath = targetPath;
            const originList = await this.getOriginList();
            if (!originList.length)
                throw new Error("当前项目暂Git源，初始化失败");
            this.emit("load:origin:end", originList);
        } catch (e) {
            console.log("操作失败。", e.message || e);
        }
    }
    async getOriginList() {
        const source = await basicCommon.execCommand("git remote -v", {
            cwd: this.storagePath,
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
        return basicCommon.execCommand("git -v");
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
        basicCommon.removeFileOrDir(this.storagePath);
    }
    async clone() {
        await basicCommon.execCommand(`git clone ${this.remote}`, {
            cwd: this.#config.local,
            stdio: ["inherit", "inherit", "pipe"],
        });

        if (!platform.isActiveEmptyGitProject(this.storagePath))
            throw new Error(
                "Git 仓库拉取失败, 请检查当前网络以及Git链接地址后重试!",
                this.remote,
            );
    }
    checkout(branch, force = false) {
        if (force) return this.pull(branch);
        return basicCommon.execCommand(`git checkout ${branch}`, {
            cwd: this.storagePath,
            stdio: ["inherit", "inherit", "pipe"],
        });
    }
    addFile(file) {
        return basicCommon.execCommand(`git add ${file}`, {
            cwd: this.storagePath,
            stdio: ["inherit", "inherit", "pipe"],
        });
    }
    commit(message) {
        return basicCommon.execCommand(`git commit -m "${message}"`, {
            cwd: this.storagePath,
            stdio: ["inherit", "inherit", "pipe"],
        });
    }
    async push(origin, branch, option = {}) {
        if (!origin || !branch) throw new Error("push remote have to origin");
        await basicCommon.execCommand(`git pull ${origin} ${branch}`);
        return basicCommon.execCommand(`git push ${origin} ${branch}`, option);
    }
    async diffFile() {
        const diffString = await basicCommon.execCommand("git status -s", {
            stdio: ["ignore", "pipe", "ignore"],
            cwd:
                this.#config.local || this.#config.storagePath || process.cwd(),
        });
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
        const fileString = await basicCommon.execCommand("git status --short");
        return fileString
            .split("\n")
            .map((item) => item.replace("M  ", ""))
            .filter((item) => item);
    }
    async pullRemoteBranch(origin, branch) {
        if (!origin || !branch)
            throw new Error("Git源或分支名称为空，拉取仓库失败！");

        return basicCommon.execCommand(`git pull ${origin} ${branch}`, {
            cwd: this.local || this.storagePath,
            stdio: ["inherit", "inherit", "pipe"],
        });
    }
    async pullRemoteForce(origin, branch) {
        if (!origin || !branch)
            throw new Error("Git源或分支名称为空，拉取仓库失败！");
        return basicCommon.execCommand(
            `git pull ${origin} ${branch} --allow-unrelated-histories`,
            {
                cwd: this.local || this.storagePath,
                stdio: ["inherit", "inherit", "pipe"],
            },
        );
    }
    async pull(branch) {
        if (!branch) branch = this.#config.branch;
        const command =
            branch === -1
                ? `git pull`
                : `git fetch --all && git checkout -f ${branch} && git reset origin/${branch} --hard && git pull`;
        await basicCommon.execCommand(command, {
            cwd: this.storagePath,
            stdio: ["inherit", "inherit", "pipe"],
        });
    }
    async fetch() {
        await basicCommon.execCommand(`git fetch --all`, {
            cwd: this.local || this.storagePath,
            stdio: ["inherit", "inherit", "pipe"],
        });
    }
    async getCurrentBranch() {
        const branch = await basicCommon.execCommand(
            "git branch --show-current",
            { cwd: this.#config.storagePath },
        );
        return (branch && branch.replaceAll("\n", "")) || "";
    }
    async getBranchRemote(origin = "") {
        const branchResult = await basicCommon.execCommand(
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
        const branchList = await basicCommon.execCommand("git branch", {
            stdio: ["ignore", "pipe", "ignore"],
        });
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
        const branchList = await basicCommon.execCommand(`git branch -a`, {
            stdio: ["ignore", "pipe", "ignore"],
        });
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
        await basicCommon.execCommand(
            `git branch --delete ${branchListContent} ${syncRemote && delRemoteBranch.length ? `&& git push ${origin} --delete ${delRemoteBranch.join(" ")}` : ""}`,
            { stdio: ["inherit", "inherit", "pipe"] },
        );
    }
    async getCommitNotPushFileList() {
        const conteString = await basicCommon.execCommand(
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
        const username = await basicCommon.execCommand("git config user.name", {
            cwd: this.#config.storagePath,
        });
        if (username.trim() && !["null", "undefined", "NaN"].includes(username))
            return username.slice(0, 10);
        return false;
    }

    async setUserName(username) {
        return await basicCommon.execCommand(
            `git config user.name ${username}`,
            { stdio: ["inherit", "inherit", "pipe"] },
        );
    }

    async createBranch(branchName) {
        return await basicCommon.execCommand(`git checkout -b ${branchName}`, {
            stdio: ["inherit", "inherit", "pipe"],
        });
    }

    async checkoutOnBasicOfOriginBranch(origin, branchName, basicOfBranch) {
        return await basicCommon.execCommand(
            `git checkout -b ${branchName} ${origin}/${basicOfBranch}`,
            { stdio: ["inherit", "inherit", "pipe"] },
        );
    }

    async checkoutOnBasicOfLocalBranch(branchName, basicOfBranch) {
        return await basicCommon.execCommand(
            `git checkout -b ${branchName} ${basicOfBranch}`,
            { stdio: ["inherit", "inherit", "pipe"] },
        );
    }

    async getNowBranchName() {
        return await basicCommon.execCommand(
            `git rev-parse --abbrev-ref HEAD`,
            { stdio: ["ignore", "pipe", "ignore"] },
        );
    }
}

module.exports = GitStorage;
