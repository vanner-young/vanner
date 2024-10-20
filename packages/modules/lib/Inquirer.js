const inquirer = require("@inquirer/prompts");
const { arrayExecSyncHandler, filterObject } = require("@mvanner/common");

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
    handler(options) {
        return arrayExecSyncHandler(
            (item) => this[item.type](filterObject(item, ["type"])),
            options,
        );
    }
}

module.exports = Inquirer;
