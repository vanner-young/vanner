# MCommon

#### 介绍

一款便捷的项目开发管理工具，目前仅支持Windows系统

#### 安装

```sh
# npm
npm install -g mavnner
# yarn
yarn global add vanner
# pnpm
pnpm add -g vanner
```

#### 使用说明

```sh
## 1. 打开命令提示符，在命令行中输入,看到命令提示符中有版本号的输出，即表示此工具安装成功。
vanner --version  # 1.0.6

## 2. 可输入 vanner 或者 vanner --help 查看此工具的使用帮助
vanner # 使用帮助列表
```

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push代码，并提交 Merge Request, 作者欢迎各位为此开源工具贡献一份力量~

#### 示例

1. 查看工具的版本信息

```sh
vanner --version || vanner -V || vanner -v

:'
1.0.1
'
```

2. 查看工具的使用帮助

```sh
vanner --help || vanner

:' 输出：
Usage: index vanners

一款便捷的项目开发管理工具

Options:
  -V, --version                             output the version number
  -h, --help                                display help for command

Commands:
  config                                    管理脚手架的配置信息
  exec [options] [filename...]              可在当前目录或指定的目录下执行系统命令或JavaScript文件(.js|.mjs)
  run [options] <command>                   运行当前项目下的项目命令
  install [options] [package@version...]    安装一个Npm包
  uninstall [options] <package@version...>  删除一个已经安装的Npm包
  init                                      根据官方或自定义的模板初始化一个项目
  template                                  管理脚手架自定义项目模板
  push [options]                            提交本地代码至Git仓库
  branch                                    对项目分支进行管理
'
```
