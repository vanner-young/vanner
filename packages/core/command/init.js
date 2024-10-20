const fs = require("fs");
const path = require("path");
const { Inquirer, GitStorage } = require("@mvanner/modules");
const { basicCommon, platform, dfsParser } = require("@mvanner/common");
const { createProjectQuestion } = require("../constance/question");
const {
    INIT_PROJECT_VITE_REMOTE,
    INIT_PROJECT_DEFAULT_NAME,
} = require("../constance");

const questionDict = {
    vite: {
        vue: {
            javaScript: "template-vue",
            typeScript: "template-vue-ts",
        },
        react: {
            javaScript: "template-react",
            typeScript: "template-react-ts",
        },
    },
};

class Init extends Inquirer {
    #config = {
        projectName: "",
    };
    #storage = {
        vite: null,
        webpack: null,
        customer: null,
    };
    aliveProject(projectName) {
        const projectPath = path.resolve(process.cwd(), projectName),
            existsProject = fs.existsSync(projectPath);
        return { projectPath, existsProject };
    }
    createProject(originPath, projectPath) {
        basicCommon.copyDirectory(originPath, projectPath);
        this.handler({
            type: "confirm",
            message: "是否需要安装依赖?",
            default: true,
        }).then((res) => {
            const packageCli = platform.getPackageCli(projectPath);
            if (res) platform.installDependencies(null, projectPath);

            console.log("\n执行以下命令运行项目");
            console.log(`1. cd ${path.basename(projectPath)}`);
            if (res) {
                console.log(`2. ${packageCli} run dev`);
            } else {
                console.log(`2. ${packageCli} install`);
            }
        });
    }
    async createOfficialTemplate(projectPath, options) {
        const { buildTools, type, language } = options;
        const templateName = dfsParser(questionDict, [
            buildTools,
            type,
            language,
        ]);
        if (!templateName) return console.log("当前配置暂未开放，敬请期待...");
        console.log(
            `正在生成中... 模板类型为：${type},  语言类型: ${language}，构建工具为: ${buildTools}`,
        );

        const originPath = path.resolve(
            this.#storage[buildTools].storagePath,
            templateName,
        );
        this.createProject(originPath, projectPath);
    }
    async generatorProjectName() {
        const projectName = await this.handler({
            type: "input",
            message: "请输入创建的项目名称",
            default: INIT_PROJECT_DEFAULT_NAME,
        });
        if (!projectName.trim()) return console.log("请输入有效的项目名称!");

        const { existsProject, projectPath } = this.aliveProject(projectName);
        if (existsProject) {
            console.log("需要创建的项目已存在，请重新输入项目名称");
            return this.generatorProjectName();
        }
        this.handler(createProjectQuestion).then((res) => {
            this.#config.projectName = projectName;
            return this.createOfficialTemplate(projectPath, res);
        });
    }
    async loadStorage() {
        const appCacheTemplatePath = path.resolve(
            platform.getProcessEnv("app_cache_template_path"),
        );

        // webpack 仓库构建
        this.#storage.webpack = null;

        // vite 仓库创建
        this.#storage.vite = new GitStorage({
            source: INIT_PROJECT_VITE_REMOTE,
            local: appCacheTemplatePath,
            isInitPull: require("./config").get("init_storage_pull"),
        });
    }
    async start() {
        await this.loadStorage();
        this.generatorProjectName();
    }
}

module.exports = new Init();
