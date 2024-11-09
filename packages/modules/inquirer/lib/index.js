const inquirer = require("@inquirer/prompts");
const { arrayExecSyncHandler, filterObject } = require("@mvanners/common");

class Inquirer {
    constructor() {
        const processError = (reason) => {
            if (!/^User force closed/i.test(reason.message))
                console.error(reason);
            process.exit(1);
        };
        process.addListener("unhandledRejection", processError);
    }
    input(options) {
        return arrayExecSyncHandler((item) => {
            return inquirer.input(item);
        }, options);
    }
    select(options) {
        return arrayExecSyncHandler((item) => {
            return inquirer.select(item);
        }, options);
    }
    confirm(options) {
        return arrayExecSyncHandler((item) => {
            return inquirer.confirm(item);
        }, options);
    }
    checkbox(options) {
        return arrayExecSyncHandler((item) => {
            return inquirer.checkbox(item);
        }, options);
    }
    search(options) {
        return arrayExecSyncHandler((item) => {
            const dataSource = item.choices,
                defaultValue = item.default;
            if (defaultValue) {
                const existsItem = dataSource.findIndex(
                    (item) => item.value === defaultValue,
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
                        ? dataSource.filter((item) => item.name.includes(input))
                        : dataSource;
                },
            });
        }, options);
    }
    handler(options) {
        return arrayExecSyncHandler(
            (item) => this[item.type](filterObject(item, ["type"])),
            options,
        );
    }
}

module.exports = Inquirer;
