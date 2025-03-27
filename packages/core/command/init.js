const path = require("path");
const Inquirer = require("@vanner/inquirer");
const GitStorage = require("@vanner/gitStorage");
const { basicCommon, platform } = require("@vanner/common");
const {
    createProjectQuestion,
    inputProjectName,
    confirmCreateProject,
    isInstallDependencies,
    createTemplateType,
    chooseSingleTemplate,
    associationStorage,
} = require("../constance/question");
const { INIT_PROJECT_ADDRESS, initProjectDict } = require("../constance");
const Branch = require("./branch");

class Init extends Inquirer {
    #config = {
        type: "",
        language: "",
        buildTools: "",
        projectName: "",
    };
    #gitStorage = null;
    async start(projectName) {
        projectName = projectName?.trim?.();
        if (projectName) this.#config.projectName = projectName;

        this.loadStorage().then(async () => {
            if (!this.#config.projectName) await this.generatorProjectName();
            // 判断，可创建官方模示例模板，也可创建本地添加的模板
            const result = await this.handler(createTemplateType());
            if (result === "official") {
                this.handler(createProjectQuestion()).then((result) => {
                    this.#config = { ...this.#config, ...result };
                    return this.createOfficialTemplate();
                });
            } else {
                const templateList = platform.getTemplateList();
                if (!templateList?.length)
                    return console.log(
                        "当前项目暂无可用的自定义模板，请使用 vanner template add 命令添加模板后重试！",
                    );

                this.handler(
                    chooseSingleTemplate(platform.getTemplateList()),
                ).then(({ chooseSingleTemplate }) => {
                    this.createProject(
                        platform.getTemplatePathByName(chooseSingleTemplate),
                        this.#config.projectName,
                    );
                });
            }
        });
    }
    async loadStorage() {
        return new Promise((resolve) => {
            this.#gitStorage = new GitStorage({
                source: INIT_PROJECT_ADDRESS,
                local: path.resolve(
                    platform.getProcessEnv("app_cache_template_path"),
                ),
                isInitPull: require("./config").get("init_storage_pull"),
            });
            this.#gitStorage.once("load:end", () => resolve(true));
        });
    }
    async generatorProjectName() {
        const projectName = await this.handler(inputProjectName());
        if (basicCommon.exists(projectName)) {
            console.log("需要创建的项目已存在，请重新输入项目名称：");
            return this.generatorProjectName();
        }
        this.#config.projectName = projectName;
    }
    async createOfficialTemplate() {
        const projectPath = path.resolve(
            process.cwd(),
            this.#config.projectName,
        );
        const { buildTools, type, language } = this.#config;
        const templateName = platform.dfsParser(initProjectDict, [
            buildTools,
            type,
            language,
        ]);
        if (!templateName) return console.log("当前配置暂未开放，敬请期待...");
        this.handler(
            confirmCreateProject({
                type,
                language,
                buildTools,
                projectName: this.#config.projectName,
            }),
        ).then((res) => {
            if (!res) return;

            this.createProject(
                path.resolve(
                    path.resolve(this.#gitStorage.storagePath, buildTools),
                    templateName,
                ),
                projectPath,
            );
        });
    }
    createProject(originPath, projectName) {
        const app_name = platform.getProcessEnv("app_name");
        basicCommon.copyDirectory(originPath, projectName, true, (originPath) =>
            originPath.includes(".git"),
        );
        this.handler(isInstallDependencies()).then(
            async (installDependencies) => {
                if (installDependencies)
                    await platform.installDependencies(app_name, projectName);

                const associationGit = await this.handler(associationStorage());
                if (associationGit)
                    await Branch.addOrigin("origin", null, projectName);

                console.log("\n执行以下命令运行项目");
                console.log(`1. cd ${path.basename(projectName)}`);
                if (installDependencies) {
                    console.log(`2.${app_name} run dev`);
                } else {
                    console.log(`2.${app_name} install`);
                    console.log(`3.${app_name} run dev`);
                }
            },
        );
    }
}

module.exports = new Init();
