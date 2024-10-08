export const createProjectQuestion = [
    {
        name: "type",
        type: "select",
        message: "请选择项目模板",
        choices: [
            {
                name: "vue 项目",
                value: "vue",
            },
            {
                name: "react 项目",
                value: "react",
            },
        ],
    },
    {
        name: "buildTools",
        type: "select",
        message: "请选择项目构建工具",
        choices: [
            {
                name: "webpack",
                value: "webpack",
            },
            {
                name: "vite",
                value: "vite",
            },
        ],
    },
    {
        name: "language",
        type: "select",
        message: "请选择使用的开发语言?",
        choices: [
            {
                name: "TypeScript",
                value: "typeScript",
            },
            {
                name: "JavaScript",
                value: "javaScript",
            },
        ],
    },
];

export const initNotExistsCustomerTemplate = (projectName, templateList) => {
    return [
        {
            name: "template",
            type: "select",
            message: `未找到 ${projectName} 名称的模板，可选择如下模板进行创建：`,
            choices: templateList.map((item) => ({ name: item, value: item })),
        },
    ];
};

export const initExistsCustomerTemplate = (projectName) => {
    return [
        {
            name: "cover",
            type: "confirm",
            message: `当前目录下已存在名称为 ${projectName} 的项目，是否覆盖创建?`,
        },
    ];
};

export const createExistProject = initExistsCustomerTemplate;

export const cloneStorageCheckoutBranch = (projectName, branch) => {
    return {
        name: "checkout",
        type: "confirm",
        message: `项目 ${projectName} 拉取成功, 当前所在分支为 ${branch} 是否需要切换分支?`,
    };
};

export const checkoutBranch = (branchList) => {
    return {
        name: "branch",
        type: "select",
        message: "请选择如下分支",
        default: false,
        choices: branchList.map((item) => ({
            name: item,
            value: item,
        })),
    };
};

export const isMoveCreateTemplateForLocal = (projectName) => {
    return {
        name: "move",
        type: "confirm",
        message: `自定义项目模板 ${projectName} 添加成功!, 是否立刻基于此模板创建项目?`,
        default: false,
    };
};

export const dropCustomerTemplateAll = () => {
    return {
        name: "drop",
        type: "confirm",
        message: `确认要删除全部的自定义项目模板吗? 删除后，项目将不会进入回收站`,
        default: false,
    };
};

export const deleteCustomerTemplateProject = (project) => {
    return {
        name: "delete",
        type: "confirm",
        message: `确认要删除 ${project} 项目模板吗?`,
        default: false,
    };
};

export const chooseDropCustomerProject = (name, projectList) => {
    return {
        name: "projectList",
        type: "checkbox",
        message: `${name} 不存在自定义模板列表中，可选择以下模板进行删除`,
        choices: projectList.map((item) => ({ name: item, value: item })),
    };
};

export const updateAllTemplate = () => {
    return {
        name: "update",
        type: "confirm",
        message: "确认要更新全部的项目模板吗?",
    };
};

export const updateCustomerTemplateProject = (project) => {
    return {
        name: "delete",
        type: "confirm",
        message: `确认要更新 ${project} 项目模板吗?`,
        default: false,
    };
};

export const updateCustomerProject = (name, projectList) => {
    return {
        name: "projectList",
        type: "checkbox",
        message: `${name} 不存在自定义模板列表中，可选择以下模板进行更新`,
        choices: projectList.map((item) => ({
            name: item,
            value: item,
        })),
    };
};

export const chooseTemplateProject = (text, projectList) => {
    return {
        name: "project",
        type: "select",
        message: text || `是否选择以下项目模板?`,
        choices: projectList.map((item) => ({
            name: item,
            value: item,
        })),
    };
};

export const unExistsExecFile = (filename) => {
    return {
        name: "backupFile",
        type: "confirm",
        message: `未检测到需要执行的文件，是否执行 ${filename} 文件?`,
    };
};
