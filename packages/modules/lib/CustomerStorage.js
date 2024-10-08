const fs = require("fs");
const path = require("path");
const { basicCommon, fileAction } = require("@mv-cli/common");

class CustomerStorage {
    #config = {
        source: null,
        local: null,
        storagePath: "",
    };

    templateList = [];

    get storagePath() {
        return this.#config.storagePath;
    }

    constructor({ source, local }) {
        if (!source || !local)
            throw new Error("缺少必要的仓库路径以及模板目录名称");
        this.#config.source = source;
        this.#config.local = local;

        this.load();
    }

    parseTemplateList() {
        const { storagePath } = this.#config;
        this.templateList = fileAction.readTargetFileTypeList(
            storagePath,
            (itemPath, statFile) => {
                if (!statFile.isDirectory()) return;
                return fileAction.isActiveEmptyGitProject(itemPath);
            },
        );
    }

    load() {
        const { source, local } = this.#config;
        this.#config.storagePath = path.resolve(local, source);
        basicCommon.createNotExistsFolder(this.#config.storagePath);

        this.parseTemplateList();
    }
}

module.exports = CustomerStorage;
