const fs = require("fs");
const path = require("path");
const { Inquirer } = require("@mv-cli/modules");
const { basicCommon, platform } = require("@mv-cli/common");

const {
    createExistProject,
    chooseTemplateProject,
    initExistsCustomerTemplate,
} = require("../constance/question");
const { INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME } = require("../constance");
const InitProject = require("./initProject");

class CreateProject extends Inquirer {
    #templateDir;
    async start(name) {
        this.#templateDir = path.resolve(
            platform.getProcessEnv("app_cache_template_path"),
            INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME,
        );
        if (!name) {
            this.selectCustomerProject();
        } else {
            this.createCustomerProject(name);
        }
    }
    async selectCustomerProject(text = false) {
        const templateList = basicCommon.readDirPathTypeFile(this.#templateDir);
        const result = await this.handler(
            chooseTemplateProject(text, templateList),
        );
        this.createCustomerProject(result, true);
    }
    async createCustomerProject(name, exists) {
        if (!exists) {
            const templateList = basicCommon.readDirPathTypeFile(
                this.#templateDir,
            );
            if (!templateList.includes(name))
                return this.selectCustomerProject(
                    `${name} 不存在当前的系统的项目模板中，可选择以下项目模板`,
                );
        }

        const projectPath = path.resolve(process.cwd(), name);
        if (fs.existsSync(projectPath)) {
            const cover = await this.handler(initExistsCustomerTemplate(name));
            if (!cover) return;
            basicCommon.deleteFolder(projectPath);
        }

        InitProject.createProject(
            path.resolve(this.#templateDir, name),
            path.resolve(process.cwd(), name),
        );
    }
    async createFolder(command) {
        const basicPath = process.cwd();
        const projectPath = path.resolve(basicPath, command);
        if (fs.existsSync(projectPath)) {
            const { cover } = await this.handler(createExistProject(command));
            if (!cover) return;
        }
        basicCommon.createCoverDir(projectPath);
        console.log("\n目录创建成功");
        console.log(`cd ${command}`);
    }
}

module.exports = new CreateProject();
