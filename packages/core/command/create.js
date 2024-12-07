const fs = require("fs");
const path = require("path");
const Inquirer = require("@vanner/inquirer");
const { basicCommon, platform } = require("@vanner/common");

const {
    createExistProject,
    chooseTemplateProject,
    chooseCreateTemplateName,
    inputProjectName,
} = require("../constance/question");
const Template = require("./template");
const { CUSTOMER_TEMPLATE_PATH } = require("../constance");

class Create extends Inquirer {
    #templateDir;
    #projectName;
    #templateList = CUSTOMER_TEMPLATE_PATH;

    async start(name, option) {
        if (option.template === "emplate")
            return console.log(`error: unknown option '-template'`);

        this.#projectName = name;
        this.#templateList = Template.getTemplateList();
        if (!this.#templateList.length)
            return console.log(
                `当前系统暂已无项目模板数据，可使用 ${platform.getProcessEnv("app_name")} template add <git remote> 进行添加`,
            );
        this.selectCustomerProject(option.template);
    }
    async createFolder() {
        const basicPath = process.cwd();
        if (!this.#projectName) {
            this.#projectName = await this.handler(inputProjectName());
        }

        const projectPath = path.resolve(basicPath, this.#projectName);
        if (fs.existsSync(projectPath)) {
            const { cover } = await this.handler(
                createExistProject(this.#projectName),
            );
            if (!cover) return;
        }
        basicCommon.createDir(projectPath, true);
        return projectPath;
    }
    async selectCustomerProject(template = false) {
        if (!template) {
            template = await this.handler(
                chooseCreateTemplateName(this.#templateList),
            );
        }
        if (!this.#templateList.includes(template))
            template = await this.handler(
                chooseTemplateProject(
                    template &&
                        `${template} 不存在当前的系统的项目模板中，可选择以下项目模板`,
                    this.#templateList,
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
