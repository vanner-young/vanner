import { execCommand } from "mv-common/pkg/node/m.process";

export class Remote {
    /**
     * 添加一个远程仓库地址
     * @param { string } name 名称
     * @param { string } url git地址
     * **/
    public static async addRemote(name: string, url: string) {
        return await execCommand(`git remote add ${name} ${url}`);
    }
}
