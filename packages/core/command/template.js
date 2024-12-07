const path = require("path");
const Inquirer = require("@vanner/inquirer");
const GitStorage = require("@vanner/gitStorage");
const { platform, basicCommon } = require("@vanner/common");
const { CUSTOMER_TEMPLATE_PATH } = require("../constance");
const {
    checkoutBranch,
    dropCustomerTemplateAll,
    deleteCustomerTemplateProject,
    cloneStorageCheckoutBranch,
    isMoveCreateTemplateForLocal,
    chooseDropCustomerProject,
    updateCustomerTemplateProject,
    updateAllTemplate,
    updateCustomerProject,
    inputTemplateUrl,
    chooseTemplateList,
    inputProjectName,
} = require("../constance/question");

class Template extends Inquirer {
    #gitStorage;
    #templateDir = CUSTOMER_TEMPLATE_PATH;
    constructor() {
        super();
        basicCommon.createDir(this.#templateDir, false);
    }

    start(type, ...rest) {
        const typeHandler = new Map([
            ["list", this.list],
            ["add", this.add],
            ["update", this.update],
            ["delete", this.delete],
        ]);

        if (typeHandler.has(type)) typeHandler.get(type).call(this, ...rest);
    }
    list() {
        const templateList = platform.getTemplateList();
        if (templateList.length) {
            templateList.forEach((item) =>
                console.log(
                    `\n名称：${item}     路径：${path.resolve(this.#templateDir, item)}`,
                ),
            );
        } else {
            console.log(
                `当前系统暂已无项目模板数据，可使用 ${platform.getProcessEnv("app_name")} template add <git remote> 进行添加`,
            );
        }
    }
    async add(gitLink) {
        if (!gitLink) gitLink = await this.handler(inputTemplateUrl());

        this.#gitStorage = new GitStorage({
            source: gitLink,
            local: this.#templateDir,
            branch: -1,
            isInitPull: true, // 新增仓库时，强制拉取一次仓库, 避免重复仓库
        });

        this.listenerGitAction();
    }
    async delete(name, source) {
        let templateList = platform.getTemplateList(),
            deleteTemplateList = [];
        if (!templateList.length) return this.list();
        if (source.all) {
            const drop = await this.handler(dropCustomerTemplateAll());
            if (!drop) return;
            basicCommon.removeFileOrDir(this.#templateDir);
            deleteTemplateList = templateList;
        } else {
            name = name.filter((item) => item.trim());
            if (!name.length) {
                name = await this.handler(chooseTemplateList(templateList));
            }
            const projectDict = { exists: [], unExists: [] };
            name.forEach((item) => {
                if (templateList.includes(item)) projectDict.exists.push(item);
                else projectDict.unExists.push(item);
            });
            if (projectDict.exists.length) {
                const result = await this.handler(
                    deleteCustomerTemplateProject(projectDict.exists),
                );
                if (!result) return;

                this.deleteMoreProject(projectDict.exists);
                templateList = platform.getTemplateList();
                deleteTemplateList.push(...projectDict.exists);
            }
            if (projectDict.unExists.length && templateList.length) {
                const delProject = await this.handler(
                    chooseDropCustomerProject(
                        projectDict.unExists.join("、"),
                        templateList,
                    ),
                );
                this.deleteMoreProject(delProject);
                deleteTemplateList.push(...delProject);
            }
        }
        console.log(
            `\n${deleteTemplateList.join("、")}累计共${deleteTemplateList.length}个模板已删除成功!`,
        );
        this.list();
    }
    async update(name, source) {
        let templateList = platform.getTemplateList(),
            updateList = [];

        if (!templateList.length) return this.list();
        if (source.all) {
            const result = await this.handler(updateAllTemplate());
            if (!result) return;
            await this.updateMoreProject(templateList);
            updateList = templateList;
        } else {
            name = name.filter((item) => item.trim());
            if (!name.length) {
                name = await this.handler(chooseTemplateList(templateList));
            }

            const projectDict = { exists: [], unExists: [] };
            name.forEach((item) => {
                if (templateList.includes(item)) projectDict.exists.push(item);
                else projectDict.unExists.push(item);
            });

            if (projectDict.exists.length) {
                const result = await this.handler(
                    updateCustomerTemplateProject(projectDict.exists),
                );
                if (!result) return;

                await this.updateMoreProject(projectDict.exists);
                updateList.push(projectDict.exists);
                templateList = templateList.filter((item) => {
                    return !projectDict.exists.includes(item);
                });
            }

            if (projectDict.unExists.length && templateList.length) {
                const result = await this.handler(
                    updateCustomerProject(
                        projectDict.unExists.join("、"),
                        templateList,
                    ),
                );
                await this.updateMoreProject(result);
                updateList.push(result);
            }
        }
        console.log(
            `\n${updateList.join("、")}累计共${updateList.length}个项目模板更新成功!`,
        );
    }
    deleteMoreProject(list) {
        list.forEach((item) => {
            basicCommon.removeFileOrDir(path.resolve(this.#templateDir, item));
        });
    }
    async updateMoreProject(list) {
        for (const item of list) {
            try {
                const itemPath = path.resolve(this.#templateDir, item);
                console.log(`\n正在更新${item}项目`);
                await basicCommon.execCommand("git fetch --all && git pull", {
                    stdio: ["inherit", "inherit", "pipe"],
                    cwd: itemPath,
                });
                console.log(`项目${item}更新成功！`);
            } catch (e) {
                console.log(
                    `项目${item}更新失败！，错误信息为：${e.message || e}`,
                );
            }
        }
    }
    listenerGitAction() {
        this.#gitStorage.once("load:end", async () => {
            const branchList = await this.#gitStorage.getBranchRemote();
            let currentBranch = await this.#gitStorage.getCurrentBranch();

            if (!branchList.length || !currentBranch)
                return console.log(
                    "Git 本地分支出现异常，操作失败，请检查网络连接后重试！",
                );

            const hasOnlyBranchCurrent =
                branchList.length === 1 && branchList.includes(currentBranch);
            if (!hasOnlyBranchCurrent) {
                const needCheckBranch = await this.handler(
                    cloneStorageCheckoutBranch(
                        this.#gitStorage.storageName,
                        currentBranch,
                    ),
                );
                if (needCheckBranch) {
                    currentBranch = await this.handler(
                        checkoutBranch(branchList),
                    );
                    await this.#gitStorage.checkout(currentBranch, true);
                }
            }
            const createLocalProject = await this.handler(
                isMoveCreateTemplateForLocal(this.#gitStorage.storageName),
            );
            if (createLocalProject) {
                const projectName = await this.handler(inputProjectName());
                const { storagePath } = this.#gitStorage;
                const localPath = path.resolve(process.cwd(), projectName);
                require("./init").createProject(storagePath, localPath);
            }
        });
    }
}

module.exports = new Template();
