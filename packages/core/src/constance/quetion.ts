/**
 * 人机交互确认消息列表
 * **/

/**
 * 询问确认要还原默认的配置信息
 * **/
export const qsForResetConfig = () => {
    return {
        name: "resetConfigFile",
        type: "confirm",
        message: "确认要还原配置吗？还原后的配置将被重置为初始状态！",
    };
};

/**
 * 询问用户当前使用哪个包管理器, 在存在 package.json 但不确定使用哪个包管理器的情况下
 * @param { Array<string> } cliList 可选择的包管理器列表
 * @param { string } defaultCli 默认的包管理器名称
 * **/
export const qsForAskWhatPkgManger = (
    cliList: Array<string>,
    defaultCli: string
) => {
    const list = cliList.filter((item) => item !== defaultCli);
    list.unshift(defaultCli);
    return {
        name: "askWhatPkgManger",
        type: "search",
        required: true,
        message: "无法确定当前项目使用的包管理器，请选择一个：",
        default: false,
        choices: list.map((item) => ({
            name: item === defaultCli ? `${item} (默认)` : item,
            value: item,
        })),
    };
};

/**
 * 当前工作目录是否要初始化git
 * **/
export const qsForAskInitStorage = () => {
    return {
        name: "isInitStorage",
        type: "confirm",
        default: false,
        require: true,
        message: "当前工作目录还未初始化git，是否需要初始化？",
    };
};

/**
 * 当前项目仓库下不存在远程地址，是否需要添加
 * **/
export const qsForAddStorageRemote = (message: string) => {
    return {
        name: "addStorageRemote",
        type: "input",
        message: message,
    };
};

/**
 * 当前项目仓库下存在多个远程地址, 选择一个
 * **/
export const qsForChooseRemote = (branchList: Array<string>) => {
    return {
        name: "chooseStorageRemote",
        type: "search",
        require: true,
        default: false,
        message: "当前项目下存在多个远程地址，请选择一个：",
        choices: branchList.map((it) => ({ name: it, value: it })),
    };
};

/**
 * 选择一个本次提交类型
 * **/
export const qsForPushType = (
    types: Array<{ name: string; value: string }>
) => {
    return [
        {
            name: "type",
            type: "search",
            require: true,
            message: "选择本次的提交类型：",
            choices: types,
        },
        {
            name: "msg",
            type: "input",
            require: true,
            default: "",
            message: "输入本次的提交备注内容：",
        },
    ];
};

/**
 * 是否直接推送本地文件至远程仓库
 * **/
export const qsForStraightforwardPushRemote = () => {
    return {
        name: "straightforwardPushRemote",
        type: "confirm",
        require: true,
        default: false,
        message: "项目未存在变更，但存在未提交的文件，是否直接推送？",
    };
};

/**
 * 选择需要暂存的文件
 * **/
export const qsForTempStorageFile = (files: Array<string>) => {
    return {
        name: "tempStorageFile",
        type: "checkbox",
        message: `请在以下列表中选择本次需要提交的文件: (输入I/A可对文件进行全选或反选)\n`,
        required: true,
        choices: files.map((item) => ({
            name: item,
            value: item,
        })),
    };
};

/**
 * 选择需要回退的文件
 * **/
export const qsForResetStorageFile = (files: Array<string>) => {
    return {
        name: "resetStorageFile",
        type: "checkbox",
        message:
            "请在以下列表中选择本次需要回退的文件: (输入I/A可对文件进行全选或反选)\n",
        required: true,
        choices: files.map((item) => ({
            name: item,
            value: item,
        })),
    };
};
