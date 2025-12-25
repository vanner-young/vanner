import { Config } from "@core/module/config";
import { PjPkg } from "@core/module/pjPkj";

export class Dependencies {
    #config: Config = new Config();

    /**
     * 判断命令行中是否存在依赖包
     * @param { Array<string> } packages 用户输入的参数信息
     * **/
    hasDes(packages: Array<string>) {
        return !!packages.find((it) => it?.trim() && !it.startsWith("-"));
    }

    /**
     * 判断是否是全局操作
     * @param { Array<string> } packages 用户输入的参数信息
     * **/
    isGlobalAction(packages: Array<string>) {
        return !!["-g", "--global"].find((flag) => packages.includes(flag));
    }

    /**
     * 取cwd及cli的 信息
     * @param { boolean } isGlobalAction 是否为全局操作
     * **/
    async confirmCwdAndCliInfo(isGlobalAction: boolean) {
        let cwd, cli;
        if (isGlobalAction) {
            cwd = process.cwd();
            const defaultCli = this.#config.get("package_cli");
            const unknownPkgAsk = this.#config.get("unknown_pkg_ask");
            if (!unknownPkgAsk) cli = defaultCli;
            else cli = await PjPkg.choosePkjCliName(defaultCli);
        } else {
            cwd = await PjPkg.getCwd(); // 获取当前执行路径
            cli = await PjPkg.getPkg(cwd); // 获取包管理器
        }

        return { cwd, cli };
    }

    /**
     * 确认是否需要mirror
     * @param { Array<string> } packages 用户输入的参数信息
     * **/
    async confirmMirror(packages: Array<string>) {
        let mirror = this.#config.get("mirror_registry");
        let isMirrorAction = this.#config.get("install_use_mirror");
        if (packages.includes("--registry")) {
            const index = packages.indexOf("--registry");
            const newMirror = packages[index + 1];
            if (newMirror) {
                mirror = newMirror;
                isMirrorAction = true;
                packages.splice(index, 2);
            }
        }

        return { isMirrorAction, mirror };
    }
}
