import { execCommand } from "mv-common/pkg/node/m.process";

export class GitSync {
    /**
     * 同步远程仓库的全部信息
     * **/
    static async syncAll(cwd?: string) {
        await execCommand(`git fetch --all`, {
            cwd: cwd || process.cwd(),
            stdio: "inherit",
        });
    }

    /**
     * 同步远程仓库的标签版本
     * **/
    static async syncTag() {
        await execCommand("git fetch --tags", {
            stdio: "inherit",
        });
    }
}
