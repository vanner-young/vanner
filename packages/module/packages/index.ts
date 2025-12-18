import { installDependencies } from "@vanner/common"

export interface PackageProps {
    cwd: string 
    packages: Array<string> 
    mirrorRegistry: string 
    toolCli: string,
    isMirrorAction: boolean
}

export type ExecType = 'install' | 'uninstall'

export class Packages {
    #type: ExecType = 'install'
    #config = {
        packages: [], // 需要安装的包
        cwd: process.cwd(), // 执行目录
        mirrorRegistry: '',// 代理镜像
        toolCli: '', // 包管理工具
        isMirrorAction: false, // 安装包时，是否需要使用代理镜像
    }
    constructor(options: PackageProps) {
        Object.assign(this.#config, options)
    }
    async initAction() {
        const { cwd, packages, mirrorRegistry, toolCli, isMirrorAction } = this.#config
        await installDependencies(toolCli, cwd, packages, isMirrorAction ? mirrorRegistry : '', '').catch(e => {
            throw new Error('安装依赖失败' + `${ packages.length ? `：${packages.join('、')}` : '' }` )
        })
    }
    uninstallAction() {
    }
    action(type: ExecType) {
        this.#type = type;
        if (this.#type === 'install') {
            this.initAction()
        } else {
            this.uninstallAction()
        }
    }
}
