import type { IndexType } from "mv-common/pkg/type";

/**
 * 设置运行时所需的程序配置
 * **/
export const setRuntimeConfig = (
    key: string | Array<{ key: string; value: string }>,
    value?: string
) => {
    if (Array.isArray(key)) {
        for (const item of key) {
            const envKey = `${
                process.env.APP_NAME
            }_${item.key.toLocaleLowerCase()}`;
            process.env[envKey] = item.value;
        }
    } else {
        const envKey = `${process.env.APP_NAME}_${key.toLocaleLowerCase()}`;
        process.env[envKey] = value;
    }
};

/**
 * 获取运行时所需的程序配置
 * **/
export const getRuntimeConfig = (key: string | Array<string>) => {
    if (Array.isArray(key)) {
        return key.reduce((pre, next) => {
            pre[next] =
                process.env[
                    `${process.env.APP_NAME}_${next.toLocaleLowerCase()}`
                ];
            return pre;
        }, {} as Record<string, string | undefined>);
    }
    return process.env[`${process.env.APP_NAME}_${key.toLocaleLowerCase()}`];
};

/**
 * 初始化运行时所需的程序配置
 * **/
export const initRuntimeConfig = (option: IndexType<string>) => {
    for (const key in option) {
        setRuntimeConfig(key, option[key] as string);
    }
};
