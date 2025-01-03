# vanner

#### 介绍

一款便捷的项目开发与模板及系统管理工具，目前仅支持Windows系统

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push代码，并提交 Merge Request, 作者欢迎各位为此开源工具贡献一份力量~

#### 安装

```sh
# npm
npm install -g vanner
# yarn
yarn global add vanner
# pnpm
pnpm add -g vanner
```

#### 使用说明

此工具的命令，在涉及到项目类的，均可在其项目的子目录下执行。在执行时，工具会定位到项目根目录，并适配对应的环境变量等。

```sh
## 1. 打开命令提示符，在命令行中输入,看到命令提示符中有版本号的输出，即表示此工具安装成功。
vanner --version

## 2. 可输入 vanner 或者 vanner --help 查看此工具的使用帮助
vanner # 使用帮助列表
```

#### 示例

1. 查看工具的版本信息

```sh
vanner --version || vanner -V || vanner -v
```

2. 查看工具的使用帮助（vanner --help）

```sh
vanner --help || vanner

:' 输出：

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

3. 设置工具的 config 配置（vanner config --help）

```sh
vanner config --help

:' 输出：

管理脚手架的配置信息

Options:
  -h, --help         display help for command

Commands:
  list               获取脚手架配置列表
  get <key>          获取脚手架的配置信息
  set <key> [value]  设置脚手架的配置信息
  delete <key>       删除脚手架配置信息
  reset              重置脚手架配置信息
  help [command]     display help for command
'
更详细的使用，可输入："vanner config (list|get|set...) --help" 来查看

其中包含一些默认配置项加以说明（以下设置均为工具自带，且无法删除）:
branch_secure=true  # 分支安全，当开启后，在使用 vanner branch del 命令的时候，master 分支将会收到保护
init_storage_pull=false ## 开启后，在 vanner template | vanner init 的时候，会默认拉取一次官方的git仓库或模板仓库的代码
request_timeout=3000 ## vanner install 在安装包时，会默认使用registry代理，当本地的代理不可用时，会使用镜像。 用于判断本地代理是否有效的超时时长，单位(MS)
default_registry=https://registry.npmmirror.com/  ## vanner 发现当本地代理无法使用时，会使用此代理值
default_package_cli=npm ## vanner install 时，会自动判断当前项目使用的 package cli，当 npm、yarn、pnpm 均未能检测到时，兜底使用的 package cli 名称
default_commit_type=fix ## vanner push 时，默认选择的本次代码提交类型
default_exec_file=index.js ## vanner exec 时，默认会执行一个文件的文件名称
default_publish_npm: true ## publish 时是否发布至 npm
default_main_branch_name: "master" ## 默认的主分支名称，用于放置被删除的保护分支以及publish的主分支判定
```

4. 执行一个JavaScript文件(vanner exec --help)

```sh
vanner exec --help

:' 输出：

可在当前目录或指定的目录下执行系统命令或JavaScript文件

Options:
  -f, --file        当值存在时, 将采用Node执行一个JavaScript 文件
  -d, --dir <path>  设置这条命令或执行文件的工作地址，默认为当前所在目录
  -h, --help        display help for command
'

## 执行一条命令: vanner exec echo xxx (执行系统命令)
## 执行一个文件： vanner exec xxx.js -f -d 2x(xxx.js 文件名称，可不传递，则默认采用 config 配置下的 default_exec_file来执行。-f 表示执行一个文件。-d 表示执行文件的地址。)
```

5. 执行一条项目(package.json -> scrips)的命令(vanner run --help)

```sh
vanner run --help

:' 输出：

运行当前项目下的项目命令

Options:
  --env <args...>  执行命令的额外参数
  -h, --help       display help for command
'
## vanner run xxx(xxx 表示命令名称，与 package.json 下的 scripts 命令对应)
```

6. 安装一个Npm包(vanner install --help)

```sh
vanner install --help

:' 输出：

安装一个Npm包

Options:
  --cli [name]  使用的包管理器名称
  --dir [path]  执行安装包时的命令工作目录
  -h, --help    display help for command
'
## 安装一个指定的包：vanner install xxx@1.0.0(xxx 表示包名，1.0.0表示版本号，可不指定版本号)
## 按照 package.json 安装全部的包：vanner install
```

7. 删除一个已经安装的Npm包(vanner uninstall --help)

```sh
vanner uninstall --help

:' 输出：

删除一个已经安装的Npm包

Options:
  --cli [name]  使用的包管理器名称
  -h, --help    display help for command
'
## 卸载包时，输入包名进行卸载: vanner uninstall xxx(xxx 表示包名称)
```

8. 根据官方或自定义的模板初始化一个项目(vanner init --help)

```sh
vanner init --help

:' 输出：

根据官方或自定义的模板初始化一个项目

Options:
  -h, --help  display help for command
'
## 可输入来初始化一个项目: vanner init xxx(xxx 表示项目名称)
```

9. 管理脚手架自定义项目模板(vanner template --help)

```sh
vanner template --help

:' 输出：

管理脚手架自定义项目模板

Options:
  -h, --help                      display help for command

Commands:
  list                            获取自定义项目模板列表
  add [gitRemote]                 添加一个自定义项目模板
  del [options] [projectName...]  删除一个或全部的自定义项目模板
  upd [options] [projectName...]  更新一个或全部的自定义项目模板
  help [command]                  display help for command
'

更详细的使用，可输入："vanner template (list|add|del...) --help" 来查看
```

10. 提交本地代码至Git仓库(vanner push --help)

```sh
vanner push --help

:' 输出：

提交本地代码至Git仓库

Options:
  -t, --type <type>         提交类型：feat|fix等
  -m, --message <message>   本次提交的消息内容
  -f, --file <filename...>  本次提交的文件
  -b, --branch <branch>     提交到Git分支的名称
  -o, --origin <origin>     提交的远程源名称
  --onlyPush                直接将暂存区的代码推送至远程分支
  -h, --help                display help for command
'

## 常用方式，输入以下命令即可。输入后跟随提示进行操作即可，也可按照上面的命令选项来减少提示步骤：
## vanner push。
```

11. 对项目分支进行管理(vanner branch --help)

```sh
vanner branch --help

:' 输出：

对项目分支进行管理

Options:
  -h, --help                  display help for command

Commands:
  add [branchName]            新增一个分支
  del [branchName...]         删除一个分支
  list                        查看分支列表
  status                      查看当前所在分支的变动文件
  addOrigin [name] [address]  为当前项目添加一个Git源
  delOrigin                   在当前项目中，删除一个Git源
  help [command]              display help for command
'

更详细的使用，可输入："vanner branch (list|add|del...) --help" 来查看
```
