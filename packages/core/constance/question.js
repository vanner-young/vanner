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

export const updateCustomerTemplateProject = (project, branch) => {
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
        message: text || `请选择以下模板进行创建`,
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

export const resetConfigFile = () => {
    return {
        name: "resetConfigFile",
        type: "confirm",
        message: "确认要还原配置信息吗?, 还原后的配置将被重置为初始状态",
    };
};

export const commitType = (message, commitType, defaultValue) => {
    return {
        name: "type",
        type: "select",
        default: defaultValue,
        message: message || "请选择本次的代码提交类型:",
        choices: commitType,
    };
};

export const commitBranch = (branchList, currentBranch) => {
    return {
        name: "commitBranch",
        type: "select",
        message: "请选择需要提交的分支:",
        default: currentBranch,
        choices: branchList.map((item) => ({
            name: item === currentBranch ? `${item}: 当前所在分支` : item,
            value: item,
        })),
    };
};

export const chooseCommitOrigin = (message, originList) => {
    return {
        name: "commitOrigin",
        type: "select",
        message:
            message || "检测项目中存在多个Git提交源，请选择本次提交源地址: ",
        choices: originList,
    };
};

export const commitMessage = () => {
    return {
        name: "commitMessage",
        type: "input",
        message: "请输入本次提交备注信息: ",
    };
};

export const commitAction = ({ branch, type, file, origin, message }) => {
    return {
        name: "commitAction",
        type: "confirm",
        default: true,
        message: `请确认以下提交信息无误:\n\n提交源名称: ${origin}\n提交分支: ${branch}\n修改类型: ${type}\n提交文件: ${file === "." ? "全部追踪的文件" : file}\n提交备注信息:\n ${message}\n\n是否提交?`,
    };
};

export const chooseCommitFile = (fileList) => {
    return {
        name: "projectList",
        type: "checkbox",
        message: `请在以下列表中选择本次需要提交的文件: (输入I/A可对文件进行全选或反选)\n`,
        required: true,
        choices: fileList.map((item) => ({ name: item, value: item })),
    };
};

export const chooseRunCommand = (command, scriptList) => {
    return {
        name: "command",
        type: "select",
        message: `${command} 脚本命令不存在，请重新选择:`,
        choices: scriptList,
    };
};

export const alreadyStatusFile = (fileList) => {
    return {
        name: "alreadyStatusFile",
        type: "confirm",
        message: `当前暂无变更的文件，但暂存区已存在文件，是否继续提交推送？\n${fileList.map((item, index) => `  ${index + 1}. ${item}`).join("\n")}`,
    };
};

export const alreadyCommitFile = (fileList) => {
    return {
        name: "alreadyCommitFile",
        type: "confirm",
        message: `当前暂存区未存在文件，但已本地提交以下文件，是否直接推送？\n${fileList.map((item, index) => `  ${index + 1}. ${item}`).join("\n")}`,
    };
};

export const alreadyStatusFileCheckout = (fileList) => {
    return {
        name: "alreadyStatusFileCheckout",
        type: "confirm",
        message: `当前暂存区存在未提交的文件，是否继续提交推送后在切换分支？\n${fileList.map((item, index) => `  ${index + 1}. ${item}`).join("\n")}`,
    };
};

export const chooseOperateType = (commitTypeDict) => {
    return {
        name: "chooseOperateType",
        type: "select",
        message: `当前未输入操作类型，请在以下类型中选择：`,
        choices: Object.entries(commitTypeDict).map(([key, value], index) => ({
            name: `  ${index + 1}. ${key + ":" + value}\n`,
            value: key,
        })),
    };
};
