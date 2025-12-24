import { isValidGitUrl } from "@vanner/common";
import { Inquirer } from "@/packages/module/inquirer";
import {
    qsForAskTlDes,
    qsForAskTlNameAndUrl,
    qsForAskTlStorage,
} from "@core/constance/quetion";
import type { IndexType } from "mv-common/pkg/type";
import { Config } from "@vanner/module";
import { config_tl_file_path } from "@core/constance";

export class Template {
    #inquirer: Inquirer;
    config: Config;

    constructor() {
        this.#inquirer = new Inquirer();
        this.config = new Config({
            sourcePath: config_tl_file_path(),
            defaultContent: {},
        });
    }

    async add(list: IndexType<string>) {
        const result: string = await this.#inquirer.handler(
            qsForAskTlNameAndUrl()
        );
        const [name, url] = result.split(" ");

        if (!name || !url) throw new Error("模板名称及仓库地址不可为空~");

        if (name in list || Object.values(list).includes(url)) {
            throw new Error("模板仓库名称或仓库地址已存在，不可重复添加~");
        }

        if (!isValidGitUrl(url)) throw new Error("仓库地址格式无效~");

        const des = await this.#inquirer.handler(qsForAskTlDes());
        return { name, url, des };
    }

    async delete() {
        const list = this.lists();
        const names = (await this.#inquirer.handler(
            qsForAskTlStorage(list)
        )) as Array<string>;
        for (const name of names) {
            this.config.delete(name as string);
        }
    }

    lists() {
        const tlList = this.config.stringify();
        const tls = [];
        if (!tlList.trim()) return [];
        for (const config of tlList.split("\n")) {
            const nameEndIndex = config.indexOf(" ");

            const name = config.slice(0, nameEndIndex);
            const value = config.replace("->", "【").replace("\r", "") + "】";
            tls.push({
                name,
                value,
                text: `${name}（${value.slice(value.indexOf("【") + 1, -1)}）`,
            });
        }
        return tls;
    }
}
