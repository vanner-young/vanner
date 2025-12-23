import * as inquirer from "@inquirer/prompts";
import { arrayExecSyncHandler, filterObject } from "@vanner/common";

export class Inquirer {
    constructor() {
        const processError = (reason: any) => {
            if (!/^User force closed/i.test(reason.message))
                console.error(reason);
            process.exit(1);
        };
        process.addListener("unhandledRejection", processError);
    }
    input(options: unknown) {
        return arrayExecSyncHandler((item) => {
            return inquirer.input(item);
        }, options);
    }
    select(options: unknown) {
        return arrayExecSyncHandler((item) => {
            return inquirer.select(item);
        }, options);
    }
    confirm(options: unknown) {
        return arrayExecSyncHandler((item) => {
            return inquirer.confirm(item);
        }, options);
    }
    checkbox(options: unknown) {
        return arrayExecSyncHandler((item) => {
            return inquirer.checkbox(item);
        }, options);
    }
    search(options: unknown) {
        return arrayExecSyncHandler((item) => {
            const dataSource = item.choices,
                defaultValue = item.default;
            if (defaultValue) {
                const existsItem = dataSource.findIndex(
                    (item: any) => item.value === defaultValue
                );
                if (existsItem !== -1) {
                    const [item] = dataSource.splice(existsItem, 1);
                    dataSource.unshift(item);
                }
            }
            item = filterObject(item, ["choices", "default"]);
            return inquirer.search({
                ...item,
                source: async (input) => {
                    return input?.trim?.()
                        ? dataSource.filter((item: any) =>
                              item.name.includes(input)
                          )
                        : dataSource;
                },
            });
        }, options);
    }
    handler<T>(options: unknown): Promise<T> {
        return arrayExecSyncHandler((item: any) => {
            const handler = (this as any)[item.type];
            return handler(filterObject(item, ["type"]));
        }, options) as Promise<T>;
    }
}
