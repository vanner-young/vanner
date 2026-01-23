import readline from "node:readline";
import { isType } from "mv-common/pkg/m.common";
import type { IndexType } from "mv-common/pkg/type";

/**
 * 过滤掉一个对象上的指定数据
 * @param { Array<any | IndexType<any>> } value 目标对象
 * @param { Array<any> } filterList 需要过滤的键值key
 * **/
export const filterObject = (
    value: Array<any | IndexType<any>>,
    filterList: Array<any>,
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
    options: any,
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
 * 获取一个文件名称的后缀（小写）
 * @param { string } filename 文件名称
 * @returns { string | void } 后缀名
 * **/
export const getFileExtension = (filename: string) => {
    if (!filename?.trim?.()) return;
    const match = filename.match(/\.([^.]+)$/);
    if (match?.[1]) return match?.[1].toLowerCase();
};

/**
 * 文件路径选择选项
 */
export interface FilePathOptions {
    /**
     * 文件扩展名过滤（如：'.json'），不区分大小写
     * 可传入数组支持多个扩展名，如：['.json', '.jsonl']
     */
    extension?: string | Array<string>;
    // 提示信息
    message?: string;
    // 是否支持多选文件
    multiple?: boolean;
}

/**
 * 提示用户输入或选择文件路径
 * @param { FilePathOptions } options 选项配置
 * @returns { Promise<string | string[]> } 单个文件路径或文件路径数组
 */
export const promptForFilePath = (
    options: FilePathOptions = {},
): Promise<string | string[]> => {
    const { extension = "", message = "", multiple = false } = options;

    // 处理扩展名格式
    const normalizeExt = (ext: string): string => {
        if (!ext) return "";
        return ext.startsWith(".")
            ? ext.toLowerCase()
            : `.${ext.toLowerCase()}`;
    };

    const allowedExtensions = Array.isArray(extension)
        ? extension.map(normalizeExt)
        : extension
          ? [normalizeExt(extension)]
          : [];

    const extDisplay =
        allowedExtensions.length > 0
            ? allowedExtensions.length === 1
                ? allowedExtensions[0]
                : allowedExtensions.join("、")
            : "";

    const defaultMsg = extDisplay
        ? multiple
            ? `请选择一个或多个 ${extDisplay} 文件`
            : `请选择一个 ${extDisplay} 文件`
        : multiple
          ? "请选择一个或多个文件"
          : "请选择一个文件";

    const displayMsg = message || defaultMsg;

    return new Promise((resolve, reject) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            prompt: "",
        });

        console.log(`\n${displayMsg}`);
        console.log("请通过以下方式提供文件路径：");
        console.log("  1. 将文件拖拽到这个终端窗口，然后按 Enter 键");
        console.log(
            multiple
                ? "  2. 多个文件可用空格分隔，或继续拖拽/输入下一个路径"
                : "  2. 直接粘贴文件路径",
        );
        console.log("  3. 手动输入文件路径");
        console.log("");

        const rlPrompt = () => {
            rl.question(
                `文件路径${multiple ? "（可输入多个，空格分隔）" : ""}（按 Ctrl+C 退出）: `,
                (line) => {
                    const input = line.trim();
                    if (!input) {
                        console.log("未检测到路径，请重试~\n");
                        rlPrompt();
                        return;
                    }

                    // 处理多选：按空格或引号分隔
                    const rawPaths: string[] = [];
                    let currentPath = "";
                    let inQuotes = false;
                    let quoteChar = "";

                    for (let i = 0; i < input.length; i++) {
                        const char = input[i];

                        if ((char === '"' || char === "'") && !inQuotes) {
                            inQuotes = true;
                            quoteChar = char;
                        } else if (char === quoteChar && inQuotes) {
                            inQuotes = false;
                            quoteChar = "";
                        } else if (char === " " && !inQuotes) {
                            if (currentPath) {
                                rawPaths.push(currentPath);
                                currentPath = "";
                            }
                        } else {
                            currentPath += char;
                        }
                    }
                    if (currentPath) {
                        rawPaths.push(currentPath);
                    }

                    // 清理路径并过滤空值
                    const cleanedPaths = rawPaths
                        .map((path) => {
                            // 去除可能自动加上的引号（Windows 和 macOS 拖拽时常见行为）
                            let cleaned = path
                                .replace(/^["']/, "")
                                .replace(/["']$/, "");

                            // Windows 路径处理：将反斜杠转换为正斜杠
                            if (process.platform === "win32") {
                                cleaned = cleaned.replace(/\\/g, "/");
                            }

                            return cleaned;
                        })
                        .filter((path) => path?.trim());

                    // 非空校验
                    if (cleanedPaths.length === 0) {
                        console.log("未检测到有效路径，请重试~\n");
                        rlPrompt();
                        return;
                    }

                    // 验证文件扩展名
                    if (allowedExtensions.length > 0) {
                        const invalidPaths: string[] = [];

                        for (const path of cleanedPaths) {
                            const fileExt = getFileExtension(path);
                            const normalizedExt = fileExt ? `.${fileExt}` : "";

                            if (!allowedExtensions.includes(normalizedExt)) {
                                invalidPaths.push(path);
                            }
                        }

                        if (invalidPaths.length > 0) {
                            console.log(
                                `错误：以下文件不是 ${extDisplay} 格式：\n  ${invalidPaths.join("\n  ")}\n`,
                            );
                            rlPrompt();
                            return;
                        }
                    }

                    rl.close();

                    if (multiple) {
                        resolve(cleanedPaths);
                    } else {
                        if (cleanedPaths?.length > 1) {
                            rl.close();
                            throw new Error("只能选择一个文件~");
                        }
                        resolve(cleanedPaths[0] as string);
                    }
                },
            );
        };

        rlPrompt();

        rl.on("SIGINT", () => {
            rl.close();
            process.exit(0);
        });
    });
};
