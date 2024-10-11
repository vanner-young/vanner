const { Command, Option } = require("commander");
const { basicCommon } = require("@mv-cli/common");

class SingleCommandRegister {
    usage(program, content) {
        return program.usage(content);
    }

    version(program, version) {
        return program.version(version);
    }

    command(program, command) {
        return program.command(command);
    }

    description(program, description) {
        return program.description(description);
    }

    option(program, option) {
        option.forEach((item) => {
            const hideHelp = item.hideHelp;
            program = program.addOption(
                hideHelp
                    ? new Option(item.command, item.description).hideHelp()
                    : new Option(item.command, item.description),
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
}

class RegisterCommand extends SingleCommandRegister {
    #commandOption;
    #singleRegister = new Map([
        [this.usage, "usage"],
        [this.version, "version"],
        [this.command, "command"],
        [this.description, "description"],
        [this.option, "option"],
        [this.action, "action"],
    ]);
    program;
    constructor(props) {
        if (!props.commandOption)
            throw new Error("missing register command for commandOption...");
        super();

        this.program = new Command();
        this.#commandOption = props.commandOption();
    }

    commandGlobalCatch(cb) {
        return this.program.action((...rest) => cb(...rest));
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

    register() {
        if (!Array.isArray(this.#commandOption))
            throw new Error("register command option must to be type Array...");

        for (const item of this.#commandOption) {
            if (item.children) {
                this.registerChildrenCommand(this.program, item);
            } else {
                this.registerCommand(this.program, item);
            }
        }

        this.program.on("command:*", () => this.program.outputHelp());
        this.program.parse(process.argv);
    }
}

module.exports = RegisterCommand;
