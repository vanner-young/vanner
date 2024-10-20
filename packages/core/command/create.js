const fs = require("fs");
const path = require("path");
const { Inquirer } = require("@mvanner/modules");
const { basicCommon, platform } = require("@mvanner/common");

const {
    createExistProject,
    chooseTemplateProject,
} = require("../constance/question");
const { INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME } = require("../constance");

class Create extends Inquirer {
    #templateDir;
    #templateName;
    async start(name, option) {
        if (option.template === "emplate")
            return console.log(`error: unknown option '-template'`);

        this.#templateDir = path.resolve(
            platform.getProcessEnv("app_cache_template_path"),
            INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME,
        );
        this.#templateName = name;
        this.selectCustomerProject(option.template);
    }
    async createFolder() {
        const basicPath = process.cwd();
        const projectPath = path.resolve(basicPath, this.#templateName);
        if (fs.existsSync(projectPath)) {
            const { cover } = await this.handler(
                createExistProject(this.#templateName),
            );
            if (!cover) return;
        }
        basicCommon.createCoverDir(projectPath);
        return projectPath;
    }
    async selectCustomerProject(template = false) {
        const templateList = basicCommon.readDirPathTypeFile(this.#templateDir);
        if (!templateList.includes(template))
            template = await this.handler(
                chooseTemplateProject(
                    template &&
                        `${template} 不存在当前的系统的项目模板中，可选择以下项目模板`,
                    templateList,
                ),
            );
        this.createCustomerProject(template);
    }
    async createCustomerProject(template) {
        const projectPath = await this.createFolder();
        require("./init").createProject(
            path.resolve(this.#templateDir, template),
            projectPath,
        );
    }
}

module.exports = new Create();
