import { execCommand } from "mv-common/pkg/node/m.process";

export interface GitBranchOption {
    cwd: string;
}

export class GitBranch {
    #config: GitBranchOption;

    constructor(props: GitBranchOption) {
        this.#config = props;
    }

    /**
     * 获取分支列表
     * @param { boolean } hasRemote 是否包含远程分支
     * **/
    async list(hasRemote: boolean) {
        const branchList = await execCommand(
            `git branch ${hasRemote ? "-a" : ""}`,
            {
                cwd: this.#config.cwd,
                stdio: ["ignore", "pipe", "ignore"],
            }
        );
        return branchList
            .split("\n")
            .map((item) => item.replace("* ", "").trim());
    }

    checkout() {
        console.log(123);
    }
}
