import { Command, Option } from "commander";

/**
 * 单条命令注册与使用类，配合命令注册配置选项使用
 * **/
export class SingleCommandRegister {
    usage(program: Command, content: string) {
        return program.usage(content);
    }

    version(program: Command, version: string) {
        return program.version(version);
    }

    command(program: Command, command: string) {
        return program.command(command);
    }

    description(program: Command, description: string) {
        return program.description(description);
    }

    allowUnknownOption(program: Command): Command {
        return program.allowUnknownOption()
    }

    option(
        program: Command,
        option: Array<{
            hideHelp: string;
            command: string;
            description: string;
        }>
    ) {
        option.forEach((item) => {
            const hideHelp = item.hideHelp;
            program = program.addOption(
                hideHelp
                    ? new Option(item.command, item.description).hideHelp()
                    : new Option(item.command, item.description)
            );
        });
        return program;
    }

    action(
        program: Command,
        action:
            | ((...rest: Array<unknown>) => void)
            | { start: (...rest: Array<unknown>) => void }
    ) {
        return program.action((...rest) => {
            if (action instanceof Function) {
                action(...rest);
            } else {
                action.start(...rest);
            }
        });
    }
}

/**
 * 多条命令注册与使用类，配合命令注册配置选项使用
 * **/
export class RegisterCommand extends SingleCommandRegister {
    program;
    #commandOption;
    #singleRegister = new Map<any, string>([
        [this.usage, "usage"],
        [this.version, "version"],
        [this.command, "command"],
        [this.description, "description"],
        [this.option, "option"],
        [this.action, "action"],
        [this.allowUnknownOption, 'allowUnknownOption']
    ]);
    constructor(props: { commandOption: () => Array<any> }) {
        super();

        this.program = new Command();
        this.#commandOption = props.commandOption();
    }

    commandGlobalCatch(cb: (command: any, option: any) => void) {
        return this.program.action(cb);
    }

    registerChildrenCommand(program: Command, item: any) {
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

    registerCommand(program: Command, item: any) {
        for (const [handler, command] of this.#singleRegister) {
            if (item[command as string]) {
                program = handler(program, item[command as string]);
            }
        }
        return program;
    }

    register() {
        if (!Array.isArray(this.#commandOption))
            throw new Error("注册命令的配置选项必须为数组");

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
