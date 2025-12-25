import { GitSync } from "@module/git/sync";
import { execCommand } from "mv-common/pkg/node/m.process";

export class GitRemote {
    /**
     * 添加一个远程仓库地址
     * @param { string } name 名称
     * @param { string } url git地址
     * **/
    static async addRemote(name: string, url: string) {
        await execCommand(`git remote add ${name} ${url}`, {
            stdio: "inherit",
        });
        await GitSync.syncAll();
    }

    /**
     * 删除一个远程仓库地址
     * @param { string } name 名称
     * **/
    static async delRemote(name: string) {
        await execCommand(`git remote remove ${name}`, {
            stdio: "inherit",
        });
    }

    /**
     * 查看当前的远程地址列表
     * **/
    static async listRemote(): Promise<{
        origin: string;
        push: Array<string>;
        fetch: Array<string>;
    }> {
        const origin = await execCommand("git remote -v");
        const list = origin.split("\n");
        const push = [],
            fetch = [];

        for (const item of list) {
            if (!item) continue;

            if (item.endsWith("(push)")) {
                push.push(item);
            } else if (item.endsWith("(fetch)")) {
                fetch.push(item);
            }
        }

        return {
            origin,
            push,
            fetch,
        };
    }
}
