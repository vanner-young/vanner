import { Template } from "@core/module/template";

export class Tl extends Template {
    constructor() {
        super();
    }

    async addTl() {
        const list = await this.config.list();
        const { name, url, des } = await this.add(list);
        this.config.set(name, `${url}->${des}`);
        this.listTl();
    }

    async listTl() {
        const list = this.lists();
        for (const config of list) {
            console.log(config.value);
        }
    }

    async delTl() {
        const list = await this.config.list();
        if (!Object.keys(list).length)
            throw new Error("模板列表为空，请先添加~");

        this.delete();
        this.listTl();
    }
}
