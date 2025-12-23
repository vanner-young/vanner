import { isType } from "mv-common/pkg/index";
import type { IndexType } from "mv-common/pkg/type";

/**
 * 过滤掉一个对象上的指定数据
 * @param { Array<any | IndexType<any>> } value 目标对象
 * @param { Array<any> } filterList 需要过滤的键值key
 * **/
export const filterObject = (
    value: Array<any | IndexType<any>>,
    filterList: Array<any>
) => {
    if (!isType(value, "object") || !isType(value, "array")) return value;

    const newVal: IndexType<any> = {};
    for (const key in value) {
        if (!filterList.includes(key)) newVal[key] = value[key];
    }
    return newVal;
};

/**
 * 顺序执行一个数组中的函数并传递参数
 * **/
export const arrayExecSyncHandler = (
    cb: (...rest: Array<any>) => Promise<unknown>,
    options: any
) => {
    if (!Array.isArray(options)) return cb(options);

    return new Promise(async (resolve) => {
        const value: any = {};
        for (const item of options) {
            const val = await cb(item);
            value[item.name] = val;
        }
        return resolve(value);
    });
};

/**
 * 获取一个文件名称的后缀
 * @param { string } filename 文件名称
 * @returns { string | void } 后缀名
 * **/
export const getFileExtension = (filename: string) => {
    if (!filename?.trim?.()) return;
    const match = filename.match(/\.([^.]+)$/);
    if (match?.[1]) return match[1];
};
