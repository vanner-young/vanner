const { Command, Option } = require("commander");
const { basicCommon } = require("@mv-cli/common");

class RegisterCommand {
    #program;
    #commandOption;
    #singleRegister = new Map([
        [this.command, "command"],
        [this.description, "description"],
        [this.option, "option"],
        [this.action, "action"],
    ]);
    constructor(props) {
        if (!props.program)
            throw new Error("missing register command for program...");
        this.#program = props.program;
        this.#commandOption = props.commandOption();
    }

    command(program, command) {
        return program.command(command);
    }

    description(program, description) {
        return program.description(description);
    }

    option(program, option) {
        option.forEach((item) => {
            program = program.addOption(
                new Option(item.command, item.description),
            );
        });
        return program;
    }

    action(program, action) {
        return program.action((...rest) => {
            if (basicCommon.isType(action, "function")) {
                action(...rest);
            } else {
                action.start(...rest);
            }
        });
    }

    registerChildrenCommand(program, item) {
        const registerConfig = () => {
            let config = new Command(item.command);
            delete item.command;

            config = this.registerCommand(config, item);
            for (const child of item.children) {
                this.registerCommand(config, child);
            }

            return config;
        };
        program.addCommand(registerConfig());
    }

    registerCommand(program, item) {
        for (const [handler, option] of this.#singleRegister) {
            if (item[option]) {
                program = handler(program, item[option]);
            }
        }
        return program;
    }

    registerAll() {
        if (!Array.isArray(this.#commandOption))
            throw new Error("register command option must to be type Array...");

        for (const item of this.#commandOption) {
            if (item.children) {
                this.registerChildrenCommand(this.#program, item);
            } else {
                this.registerCommand(this.#program, item);
            }
        }
    }
}

module.exports = RegisterCommand;
