import { Template } from "@core/module/template";
import { Git } from "@vanner/module";
import { Inquirer } from "@/packages/module/inquirer";
import { qsForAskSingleStorage } from "@core/constance/quetion";
import { getRuntimeFlag, RuntimeFlag } from "@vanner/common";

export class Init {
    #tl: Template;
    #inquirer: Inquirer;

    constructor() {
        this.#tl = new Template();
        this.#inquirer = new Inquirer();
    }

    async getGitUrl() {
        const lists = this.#tl.lists();
        const name = await this.#inquirer.handler(qsForAskSingleStorage(lists));
        const [url] = this.#tl.config.get(name as string).split("->");
        return url;
    }

    async cloneProject(url: string) {
        const git = new Git();
        await git.cloneGitProject(url, process.cwd());
    }

    async start() {
        const hasGit = getRuntimeFlag(RuntimeFlag.git);
        if (!hasGit)
            throw new Error(
                "当前系统未存在git，请根据此链接进行安装后重试：https://git-scm.com"
            );

        const url = await this.getGitUrl();
        await this.cloneProject(url);
    }
}
