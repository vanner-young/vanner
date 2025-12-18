import ini from "ini";
import type { IndexType } from "mv-common/pkg/type";
import { createFile, readExistsFile } from "mv-common/pkg/node/m.file";
import { config_tool_file_path } from "@core/constance";

export interface ConfigProps {
    sourcePath: string;
    defaultContent: IndexType<unknown>;
}

export class Config {
    data = new Map();
    #sourcePath; // 缓存文件目录
    #defaultContent: ConfigProps["defaultContent"]; // 默认配置
    constructor({ sourcePath, defaultContent = {} }: ConfigProps) {
        this.#sourcePath = sourcePath;
        this.#defaultContent = defaultContent || {};
        this.#load();
    }
    /**
     * 将配置重置为参数中的配置
     * @param { ConfigProps["defaultContent"] } parseContent 参数对象
     * **/
    #resetOptionConfig(parseContent: ConfigProps["defaultContent"] = {}) {
        if (Object.keys(parseContent)?.length) {
            this.data.clear();
            Object.entries(parseContent).forEach(([key, value]) => {
                this.data.set(key, value);
            });
        }
        this.save();
    }
    /**
     * 如果参数中不存在默认配置，则写入默认配置参数
     * **/
    #writeNotExistsDefaultData() {
        Object.keys(this.#defaultContent).forEach((key) => {
            if (!this.data.has(key)) {
                this.data.set(key, this.#defaultContent[key]);
            }
        });
        this.save();
    }
    /**
     * 加载参数
     * **/
    #load() {
        createFile(
            this.#sourcePath,
            ini.stringify(this.#defaultContent).trim()
        );
        this.#resetOptionConfig(
            ini.parse(readExistsFile(this.#sourcePath).toString())
        );
        this.#writeNotExistsDefaultData();
    }
    /**
     * 查看是否存在值
     * @param { string } key 键
     * **/
    has(key: string) {
        return this.data.has(key);
    }
    /**
     * 获取参数配置
     * @param { string } key 键
     * **/
    get(key: string) {
        return this.data.get(key);
    }
    /**
     * 设置参数配置
     * @param { string } key 键
     * @param { string } value 值
     * **/
    set(key: string, value: string) {
        if (!value) {
            return this.delete(key);
        } else {
            this.data.set(key, value);
        }
        this.save();
    }
    /**
     * 删除参数配置
     * @param { string } key 键
     * **/
    delete(key: string) {
        if (!this.has(key)) return;
        this.data.delete(key);
        this.save();
    }
    /**
     * 重置参数配置
     * **/
    reset() {
        createFile(
            `${config_tool_file_path()}.${Date.now()}`,
            ini.stringify(Object.fromEntries(this.data)).trim(),
            true
        );
        this.#resetOptionConfig(this.#defaultContent);
    }
    /**
     * 持久化保存参数配置
     * **/
    save() {
        createFile(this.#sourcePath, this.stringify(), true);
    }
    /**
     * 列出所有的参数配置
     * **/
    list() {
        return Object.fromEntries(this.data);
    }
    /**
     * 字符串化参数配置
     * **/
    stringify() {
        return ini.stringify(this.list()).trim();
    }
}
