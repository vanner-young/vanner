import { execCommand } from "mv-common/pkg/node/m.process";
import { GitSync } from "@module/git/sync";

export class GitBranch {
    /**
     * 获取分支列表
     * @param { boolean } hasRemote 是否包含远程分支
     * **/
    static async list(hasRemote: boolean) {
        await GitSync.syncAll();

        const branchList = await execCommand(
            `git branch ${hasRemote ? "-a" : ""}`,
            {
                stdio: ["ignore", "pipe", "ignore"],
            }
        );
        return branchList
            .split("\n")
            .map((item) => item.replace("* ", "").trim());
    }
}
