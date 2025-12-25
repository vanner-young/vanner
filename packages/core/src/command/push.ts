import { PjGit } from "@core/module/pjGit";

export class Push extends PjGit {
    async verify() {
        await this.confirmGitEnv(); // 确保 git 环境存在
        const remote = await this.confirmGitRemote(); // 确认使用的项目源地址
        const branch = await this.confirmBranch(); // 确认分支名称

        return { remote, branch };
    }

    async start(option: { tag: boolean }) {
        const { remote, branch } = await this.verify();
        const options = await this.confirmPushFile();
        if (!options || !remote || !branch) return;
        if (options.type === "remote") {
            await this.pushRemote({ remote, branch }); // 本地不存在变更，但存在未推送的文件
        } else {
            const { type, msg } = await this.confirmPushType(); // 确认提交类型
            await this.commitPushRemote({
                remote,
                branch,
                type,
                msg: msg,
                file: options.file,
            });
        }

        if (!option.tag) return;

        // 推送tag
        await this.releaseTag(remote);
    }
}
