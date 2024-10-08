const inquirer = require("@inquirer/prompts");
const { arrayExecSyncHandler, filterObject } = require("@mv-cli/common");

class Inquirer {
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
