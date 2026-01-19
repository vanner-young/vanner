// 忽略旗帜 - 当报错遇到此标志时，忽略任何错误输出
export const ignore_flag = "IGNORE-FLAG";

// claude 自定义模型配置
export const claude_model = [
    {
        name: "GLM(智谱)",
        value: "GLM",
        option: {
            ANTHROPIC_BASE_URL: {
                text: "BaseUrl",
                value: "https://open.bigmodel.cn/api/anthropic",
            },
            ANTHROPIC_AUTH_TOKEN: {
                text: "验证Token",
                value: "",
            },
            ANTHROPIC_MODEL: {
                text: "模型名称",
                value: "",
            },
        },
    },
    {
        name: "qw(千问模型)",
        value: "QW",
        option: {
            ANTHROPIC_BASE_URL: {
                text: "BaseUrl",
                value: "https://dashscope.aliyuncs.com/apps/anthropic",
            },
            ANTHROPIC_AUTH_TOKEN: {
                text: "验证Token",
                value: "",
            },
            ANTHROPIC_MODEL: {
                text: "模型名称",
                value: "",
            },
        },
    },
];
