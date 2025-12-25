import { Config } from "@core/module/config";
import { qsForAskWhatPkgManger } from "@core/constance/quetion";
import {
    config_pkg_manger_file_path,
    support_package_manger_name,
} from "@core/constance";

import { Config as ConfigModule, Inquirer } from "@vanner/module";
import {
    getPackageMangerName,
    getRuntimeFlag,
    RuntimeFlag,
    searchCwdPath,
} from "@vanner/common";

/**
 * 项目中包管理器的抽离公共逻辑
 * **/
export class PjPkg {
    static get runtimeFlag() {
        return getRuntimeFlag(RuntimeFlag.cli);
    }

    /**
     * 根据当前的运行时工具，获取支持的包管理器
     * **/
    static getPackageName() {
        const flag = PjPkg.runtimeFlag;
        let cliList = [...support_package_manger_name];

        if (flag) {
            if (flag === "bun") {
                cliList = cliList.filter((it) => ["bun"].includes(it));
            } else if (flag === "node") {
                cliList = cliList.filter((it) =>
                    ["npm", "yarn", "pnpm"].includes(it)
                );
            }
        }

        return cliList;
    }

    /**
     * 选择当前已经系统支持的包管理器名称
     * @param { string } defaultName 配置文件中设置的默认包管理器名称
     * **/
    static async choosePkjCliName(defaultName: string) {
        let cli = "";
        const cliList = PjPkg.getPackageName();

        if (cliList.length === 1 && cliList[0]) {
            cli = cliList[0];
        } else {
            const inquirer = new Inquirer();
            cli = await inquirer.handler<string>(
                qsForAskWhatPkgManger(cliList, defaultName)
            );
        }
        return cli;
    }

    /**
     * 传递一个项目路径，获取这个路径下的包管理器
     * @param { string } cwd  项目路径
     * **/
    static async getPkg(cwd: string) {
        let cli = getPackageMangerName(cwd);

        if (!cli) {
            const pkgMangerConfig = new ConfigModule({
                sourcePath: config_pkg_manger_file_path(),
                defaultContent: {},
            });
            cli = pkgMangerConfig.get(cwd);
            if (!cli) {
                const config = new Config();
                if (config.get("unknown_pkg_ask")) {
                    cli = await this.choosePkjCliName(
                        config.get("package_cli")
                    );

                    // 记录至配置文件，下次不再询问
                    pkgMangerConfig.set(cwd, cli);
                }
            }
        } else {
            // 当项目中存在的包管理器名称与当前系统的cli不匹配，则抛出异常
            const flag = PjPkg.runtimeFlag;
            if (flag) {
                if (
                    (flag === "node" && cli === "bun") ||
                    (flag === "bun" && cli !== "bun")
                ) {
                    throw new Error(
                        "当前项目中的包管理器与运行工具不匹配，请检查后重试~"
                    );
                }
            }
        }

        if (cli) return cli;
        throw new Error("当前路径下无法确定使用具体的包管理器！");
    }

    /**
     * 以当前执行路径为基准，查询当前目录及向上查询项目的可执行目录
     * **/
    static async getCwd() {
        return searchCwdPath("package.json");
    }
}
