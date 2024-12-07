const Inquirer = require("@vanner/inquirer");
const { basicCommon, platform } = require("@vanner/common");

class Exec extends Inquirer {
    get defaultExecFileName() {
        return platform.getProcessEnv("default_exec_file");
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
        basicCommon.execCommand(source.join(" "), {
            stdio: ["inherit", "inherit", "pipe"],
            cwd: option.dir || process.cwd(),
        });
    }

    async execFile(source, option) {
        source = source.filter((item) => item.trim());
        if (!source.length) {
            source = [this.defaultExecFileName];
        }
        const invalidFile = [],
            execFile = [];
        for (const item of source) {
            const type =
                /\.(js|mjs)$/.test(item) &&
                basicCommon.exists(item, process.cwd())
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
            basicCommon.execCommand(`node ${item}`, {
                stdio: ["inherit", "inherit", "pipe"],
                cwd: option.dir || process.cwd(),
            });
            console.log(`exec file ${item} is end...`);
        }
    }
}

module.exports = new Exec();
