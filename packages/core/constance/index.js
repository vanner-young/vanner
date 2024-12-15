const path = require("path");
const { basicCommon: common } = require("@vanner/common");
const { name } = require("../../../package.json");

const basicConfig = {
    SUPPORT_SYSTEM: ["win32"], // 支持的系统平台
    APP_DIR_NAME: "." + name, // APP缓存目录名称
    APP_CACHE_NAME: ".Cache",
    SOURCE_FILE_NAME: ".mv.cli.rc", // APP配置文件名称
    APP_DESCRIPTION: "一款便捷的项目开发管理工具", // 脚手架简介
    INIT_PROJECT_TEMPLATE_DIR_NAME: "Template", // 脚手架模板缓存目录名称
    INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME: "customer", // 脚手架模板缓存自定义名称
    INIT_PROJECT_ADDRESS: "https://gitee.com/memory_s/mv-template.git", // 初始化项目管理仓库地址
};

// 默认配置文件的内容
const defaultConfigModuleContent = {
    branch_secure: true, // 分支保护，在对分支操作时，['master']分支不可删除
    init_storage_pull: false, // 初始化Git仓库时，是否需要拉取一次仓库的代码
    request_timeout: 3000, // 请求超时时长，单位: ms
    default_registry: "https://registry.npmmirror.com/", // 默认包版本工具的镜像
    default_package_cli: "npm", // 默认的包管理工具
    default_commit_type: "fix", // 提交代码时，默认选中的提交类别
    default_exec_file: "index.js", // 执行文件时，默认执行的文件名称
    default_publish_npm: true, // publish 时是否发布至 npm
    default_main_branch_name: "master", // 默认的主分支名称
};

// git 提交类型列表
const commitTypeDict = {
    feat: "新功能开发",
    fix: "修复问题",
    docs: "新增文档注释",
    style: "新增代码格式(不影响代码运行的变动)",
    refactor: "重构或优化代码",
    perf: "对代码进行性能优化",
    test: "增加测试",
    chore: "构建过程或辅助工具的调整",
    revert: "代码回退",
};

// 初始化模板的仓库列表
const initProjectDict = {
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

// 用户家目录
const HOME_PATH = common.getAppData();

// 缓存目录路径
const APP_CACHE_PATH = path.resolve(HOME_PATH, basicConfig.APP_DIR_NAME);

// 项目模板路径
const APP_TEMPLATE_PATH = path.resolve(
    APP_CACHE_PATH,
    basicConfig.INIT_PROJECT_TEMPLATE_DIR_NAME,
);

// 项目自定义模板路径
const CUSTOMER_TEMPLATE_PATH = path.resolve(
    APP_TEMPLATE_PATH,
    basicConfig.INIT_PROJECT_TEMPLATE_CUSTOMER_DIR_NAME,
);

// 项目配置文件路径
const APP_CONFIG_PATH = path.resolve(
    APP_CACHE_PATH,
    basicConfig.SOURCE_FILE_NAME,
);

module.exports = {
    ...basicConfig,
    APP_CACHE_PATH,
    APP_TEMPLATE_PATH,
    APP_CONFIG_PATH,
    CUSTOMER_TEMPLATE_PATH,
    defaultConfigModuleContent,
    commitTypeDict,
    initProjectDict,
};
