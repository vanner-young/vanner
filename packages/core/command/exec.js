const Inquirer = require("@mvanners/inquirer");
const { basicCommon, platform } = require("@mvanners/common");

class Exec extends Inquirer {
    defaultFileName;

    constructor() {
        super();
        this.defaultFileName = platform.getProcessEnv("default_exec_file");
    }

    start(source, option) {
        if (option.dir === "ir")
            return console.log(`error: unknown option '-dir'`);

        if (option.file) {
            this.execFile(source, option);
        } else {
            this.execCommand(source, option);
        }
    }

    execCommand(source, option) {
        basicCommon.execCommandPro(source.join(" "), {
            stdio: "inherit",
            cwd: option.dir || process.cwd(),
        });
    }

    async execFile(source, option) {
        source = source.filter((item) => item.trim());
        if (!source.length) {
            source = [this.defaultFileName];
        }
        const invalidFile = [],
            execFile = [];
        for (const item of source) {
            const type =
                /\.(js|mjs)$/.test(item) && basicCommon.existsFileForCwd(item)
                    ? execFile
                    : invalidFile;
            type.push(item);
        }

        if (!execFile.length)
            return console.log(
                `文件执行失败, 请重试。以下文件不合法或不存在当前目录: \n${invalidFile.join("、")}`,
            );

        if (invalidFile.length) {
            console.log(
                `以下文件不合法或不存在当前目录，将跳过: \n${invalidFile.join("、")}\n`,
            );
        }
        for (const item of execFile) {
            basicCommon.execCommandPro(`node ${item}`, {
                stdio: "inherit",
                cwd: option.dir || process.cwd(),
            });
            console.log(`exec file ${item} is end...`);
        }
    }
}

module.exports = new Exec();
