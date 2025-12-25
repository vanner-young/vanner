import { PjGit } from "@core/module/pjGit";
import { GitRemote } from "@vanner/module";

export class Remote extends PjGit {
    async add() {
        await this.confirmGitEnv();
        const { name, url } = await this.confirmRemoteInfo();
        const remotes = await this.remote();
        for (const remote of remotes) {
            if (remote.origin === name)
                throw new Error("当前源名称已存在，请重试~");
            else if (remote.remote === url)
                throw new Error("当前源地址已存在，请重试~");
        }
        await GitRemote.addRemote(name, url);
        await this.list();
    }

    async del() {
        await this.confirmGitEnv();
        const remote = (await this.chooseStorageSingleRemote()) as string;
        await GitRemote.delRemote(remote);
        await this.list();
    }

    async list() {
        await this.confirmGitEnv();
        const { push } = await GitRemote.listRemote();
        if (push.length) console.log(push.join("\n"));
    }
}
