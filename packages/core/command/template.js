const path = require("path");
const { platform, basicCommon } = require("@mvanner/common");
const { Inquirer, GitStorage } = require("@mvanner/modules");
const { INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME } = require("../constance");
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
} = require("../constance/question");

class Template extends Inquirer {
    #gitStorage;
    #templateDir;

    start(type, ...rest) {
        const typeHandler = new Map([
            ["list", this.list],
            ["add", this.add],
            ["update", this.update],
            ["delete", this.delete],
        ]);

        if (typeHandler.has(type)) {
            this.#templateDir = path.resolve(
                platform.getProcessEnv("app_cache_template_path"),
                INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME,
            );
            typeHandler.get(type).call(this, ...rest);
        }
    }
    list() {
        const templateList = basicCommon.readDirPathTypeFile(this.#templateDir);
        if (templateList.length) {
            console.log("项目模板列表如下：");
            templateList.forEach((item) =>
                console.log(
                    `${item}     ${path.resolve(this.#templateDir, item)}`,
                ),
            );
        } else {
            console.log(
                "当前系统暂已无项目模板数据，可使用 mvanner template add <git remote> 进行添加",
            );
        }
    }
    add(gitLink) {
        this.#gitStorage = new GitStorage({
            source: gitLink,
            local: this.#templateDir,
            branch: -1,
            isInitPull: true, // 新增仓库时，强制拉取一次仓库, 避免重复仓库
        });

        this.listenerGitAction();
    }
    async delete(name, source) {
        let templateList = basicCommon.readDirPathTypeFile(this.#templateDir),
            deleteTemplateList = [];

        if (!templateList.length) return this.list();
        if (source.all) {
            const drop = await this.handler(dropCustomerTemplateAll());
            if (!drop) return;
            basicCommon.deleteFolder(this.#templateDir);
            deleteTemplateList = templateList;
        } else {
            name = name.filter((item) => item.trim());
            if (!name.length)
                return `error: missing required argument 'project'`;
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
                templateList = basicCommon.readDirPathTypeFile(
                    this.#templateDir,
                );
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
            `${deleteTemplateList.join("、")}累计共${deleteTemplateList.length}个模板已删除成功!\n`,
        );
        this.list();
    }
    async update(name, source) {
        let templateList = basicCommon.readDirPathTypeFile(this.#templateDir),
            updateList = [];

        if (!templateList.length) return this.list();
        if (source.all) {
            const result = await this.handler(updateAllTemplate());
            if (!result) return;
            await this.updateMoreProject(templateList);
            updateList = templateList;
        } else {
            name = name.filter((item) => item.trim());
            if (!name.length)
                return `error: missing required argument 'project'`;
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
            `${updateList.join("、")}累计共${updateList.length}个项目模板更新成功!`,
        );
    }
    deleteMoreProject(list) {
        list.forEach((item) => {
            basicCommon.deleteFolder(path.resolve(this.#templateDir, item));
        });
    }
    async updateMoreProject(list) {
        for (const item of list) {
            const itemPath = path.resolve(this.#templateDir, item);
            console.log(`正在更新${item}项目`);
            await basicCommon.execCommandPro("git pull", {
                stdio: "inherit",
                cwd: itemPath,
            });
            console.log(`项目${item}更新成功！`);
        }
    }
    listenerGitAction() {
        this.#gitStorage.once("load:end", async () => {
            const branchList = await this.#gitStorage.getBranchRemote();
            let currentBranch = await this.#gitStorage.getCurrentBranch();

            if (!branchList.length || !currentBranch)
                throw new Error(
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
                const { storagePath, storageName } = this.#gitStorage;
                const localPath = path.resolve(process.cwd(), storageName);
                require("./init").createProject(storagePath, localPath);
            }
        });
    }
}

module.exports = new Template();
