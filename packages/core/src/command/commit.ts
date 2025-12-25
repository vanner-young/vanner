import { PjGit } from "@core/module/pjGit";

export class Commit extends PjGit {
    async verify() {
        await this.confirmGitEnv(); // 检测 git环境
    }

    async start(option: { amend: boolean }) {
        await this.verify();
        if (option.amend) return this.rewriteMsg();

        let localFile = await this.confirmLocalCommitFile(); // 确认本次提交的文件
        if (!localFile.length)
            throw new Error("当前项目下，暂无需要暂存的文件~");

        const { type, msg } = await this.confirmPushType();
        await this.commitToLocal({ file: localFile, type, msg });
    }
}
