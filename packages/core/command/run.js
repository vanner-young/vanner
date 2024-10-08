const { Inquirer } = require("@mv-cli/modules");
const { basicCommon } = require("@mv-cli/common");

const { unExistsExecFile } = require("../constance/question");

class Run extends Inquirer {
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
        let filename = source.at(0);
        if (!filename) {
            const backupFile = "index.js";
            if (!basicCommon.existsFileForCwd(backupFile)) {
                return console.log(
                    "请输入需要执行的文件后重试, mv-cli run <filename> --file",
                );
            }
            const execBackupFile = await this.handler(
                unExistsExecFile(backupFile),
            );
            if (!execBackupFile) return;
            filename = backupFile;
        } else {
            if (!basicCommon.existsFileForCwd(filename))
                return console.log(`当前目录下不存在 ${filename} 的文件...`);
        }

        if (!/\.(js|mjs)$/.test(filename)) {
            return console.log(
                "不支持的文件后缀, 仅支持: js、mjs 的文件",
                filename,
            );
        }
        basicCommon.execCommandPro(`node ${filename}`, {
            stdio: "inherit",
            cwd: option.dir || process.cwd(),
        });
    }
}

module.exports = new Run();
