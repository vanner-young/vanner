import { PjGit } from "@core/module/pjGit";

export class Reset extends PjGit {
    async verify() {
        await this.confirmGitEnv();
    }

    async start(option: { commit: boolean }) {
        await this.verify(); // 检测git环境
        this.resetTempOrCommitAction(option.commit ? "commit" : "workspace");
    }
}
