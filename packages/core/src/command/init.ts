import { resolve } from "node:path";
import { Template } from "@core/module/template";
import { Git, GitSync } from "@vanner/module";
import { Inquirer } from "@/packages/module/inquirer";
import { qsForAskSingleStorage } from "@core/constance/quetion";
import { PjGit } from "@core/module/pjGit";

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
        const folderName = await git.cloneGitProject(url, process.cwd());
        if (folderName)
            await GitSync.syncAll(resolve(process.cwd(), folderName));
    }

    async start() {
        const pjGit = new PjGit();
        await pjGit.confirmGitEnv(false);

        const url = await this.getGitUrl();
        await this.cloneProject(url);
    }
}
