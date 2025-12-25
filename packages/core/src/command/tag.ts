import { PjGit } from "@core/module/pjGit";

export class Tag extends PjGit {
    async add() {
        await this.confirmGitEnv();
        await this.releaseTag();
    }

    async list() {
        await this.confirmGitEnv();
        await this.tags(true);
    }
}
