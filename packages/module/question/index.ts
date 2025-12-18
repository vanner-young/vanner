// 还原默认的配置信息[command: config]
export const questionForResetConfig = () => {
    return {
        name: "resetConfigFile",
        type: "confirm",
        message: "确认要还原配置吗？还原后的配置将被重置为初始状态！",
    };
};
