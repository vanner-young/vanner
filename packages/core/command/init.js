const fs = require("fs");
const path = require("path");
const Inquirer = require("@mvanners/inquirer");
const GitStorage = require("@mvanners/gitStorage");
const { basicCommon, platform } = require("@mvanners/common");
const {
    createProjectQuestion,
    inputProjectName,
} = require("../constance/question");
const { INIT_PROJECT_VITE_REMOTE } = require("../constance");

const questionDict = {
    webpack: {
        vue: {
            javaScript: "template-vue3",
            typeScript: "template-vue3-ts",
        },
        react: {
            javaScript: "template-react",
            typeScript: "template-react-ts",
        },
    },
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
    #gitStorage = null;
    async start() {
        this.loadStorage().then(() => this.generatorProjectName());
    }
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
        const templateName = platform.dfsParser(questionDict, [
            buildTools,
            type,
            language,
        ]);
        if (!templateName) return console.log("当前配置暂未开放，敬请期待...");
        console.log(
            `正在生成中... 模板类型为：${type},  语言类型: ${language}，构建工具为: ${buildTools}`,
        );

        this.createProject(
            path.resolve(
                path.resolve(this.#gitStorage.storagePath, buildTools),
                templateName,
            ),
            projectPath,
        );
    }
    async generatorProjectName() {
        const projectName = await this.handler(inputProjectName());

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
        return new Promise((resolve) => {
            const appCacheTemplatePath = path.resolve(
                platform.getProcessEnv("app_cache_template_path"),
            );

            this.#gitStorage = new GitStorage({
                source: INIT_PROJECT_VITE_REMOTE,
                local: appCacheTemplatePath,
                isInitPull: require("./config").get("init_storage_pull"),
            });
            this.#gitStorage.once("load:end", () => resolve(true));
        });
    }
}

module.exports = new Init();
