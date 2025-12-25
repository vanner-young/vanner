# vanner

#### 介绍

一款便捷的项目开发与模板及系统管理工具，目前支持 Windows|mac 系统
新版 2.0 采用 bun + ts 进行重构，对命令行进行了重写，增强了兼容性的同时，为了使其更加公用化，去除了一些不常用的命令。
1.x 版本在开发完成后，处于试运行状态，体验不是很好，为对其进行封存，2.x 版本是全新版本，将持续迭代。
新的版本作者将会持续维护中，欢迎各位同行进行技术和需求交流 ~~

#### 贡献

1.  Fork 本仓库
2.  新建 feat/xxx 分支
3.  Push 代码，并提交 Merge Request, 作者欢迎各位为此开源工具贡献一份力量~

#### 安装

```sh
# npm
npm install -g vanner
# yarn
yarn global add vanner
# pnpm
pnpm add -g vanner
# bun
bun add -g vanner
```

#### 使用说明

此工具的命令，在涉及到项目类的，均可在其项目的子目录下执行。在执行时，工具会定位到项目根目录，并适配对应的环境变量等。

```sh
## 1. 打开命令提示符，在命令行中输入,看到命令提示符中有版本号的输出，即表示此工具安装成功。
vanner -v

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

一款可对项目、依赖、仓库、模板进行便捷式的命令行工具

Options:
  -V, --version             output the version number
  -h, --help                display help for command

Commands:
  config                    管理命令行工作的配置信息
  add [package@version...]  在本地项目中安装一个或多个依赖包
  del [package@version...]  在本地项目中删除一个或多个依赖包
  run <command> [args...]   在本地项目中运行一个项目命令
  ex <filename> [args...]   在当前的目录下使用(node/bun)执行一个文件（支持 .js/.ts/.html 文件）
  push [options]            将本地代码提交至远程仓库
  commit [options]          将代码提交至本地工作区
  reset [options]           还原暂存区或已提交至本地的代码
  tl                        管理项目模板，执行init时，可根据此模板创建项目（项目模板只能是一个git仓库）
  init                      基于tl创建的模板仓库，创建一个项目
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
  list               获取命令行配置列表
  get <key>          获取命令行的配置信息
  set <key> [value]  设置命令行的配置信息
  del <key>          删除命令行配置信息
  reset              重置命令行配置信息
  help [command]     display help for command
'
更详细的使用，可输入："vanner config (list|get|set...) --help" 来查看

其中包含一些默认配置项加以说明（以下设置均为工具自带，且无法删除）:
main_branch        = main/master 【主分支名称，设置多个时，通过'/'隔开，用于tag标签】
mirror_registry    = https://registry.npmmirror.com/ 【包管理器执行时的代理镜像】
package_cli        = npm 【默认的包管理器名称（项目中的lock文件权重大于此值的设置）】
unknown_pkg_ask    = true 【遇到未知包管理器时，是否询问用户（true：询问、false: （使用 package_cli 设置的值））】
install_use_mirror = false 【装包时，默认是否使用 mirror_registry的值作为安装镜像（用户在命令行中输入的 --registry 权重大于当前值的设置）】
tag_security       = true 【在打标签时，是否开启对 main_branch 的验证（当前分支属于main_branch的值）】
```

4. 执行一个 JavaScript 文件(vanner exec --help)

```sh
## ex 在执行 js 文件时，会采用nodejs，非js文件时，会采用 bun。支持 node|bun的全部命令行参数，args会全部传递给node|bun进行执行（vanner ex [...args]）
vanner ex --help

:' 输出：

在当前的目录下使用(node/bun)执行一个文件（支持 .js/.ts/.html 文件）

Options:
  -h, --help  display help for command
'

## 执行一个js 文件
vanne ex index.js

## 执行一个ts文件
vanner ex index.ts

## 执行一个html文件(-w 会在本地开启一个http服务，并在可在文件发生变化时，自动刷新)
vanner ex index.html -w
```

5. 执行一个命令(package.json -> scrips)的命令(vanner run --help)

```sh
## run 在执行时，支持 node|bun的全部命令行参数，args会全部传递给node|bun进行执行（vanner run [...args]）
vanner run --help

:' 输出：

Usage: main run [options] <command> [args...]

在本地项目中运行一个项目命令

Options:
  -h, --help  display help for command
'

vanner run start
## 或者
vanner run dev
```

6. 安装一个 Npm 包(vanner add --help)

```sh
## add 在执行时，支持 node|bun的全部命令行参数，args会全部传递给node|bun进行执行（vanner run [...args]）
vanner add --help

:' 输出：

在本地项目中安装一个或多个依赖包

Options:
  -h, --help  display help for command
'
vanner add lodash
vanner add lodash@xxx xx@xxx -g
vanner add xxx --save-dev
```

7. 删除一个已经安装的 Npm 包(vanner del --help)

```sh
## del 在执行时，支持 node|bun的全部命令行参数，args会全部传递给node|bun进行执行（vanner run [...args]）
vanner del --help

:' 输出：

在本地项目中删除一个或多个依赖包

Options:
  -h, --help  display help for command
'
vanner del lodash
vanner del lodash@xxx xx@xxx -g
vanner del xxx --save-dev
```

8. 管理脚手架自定义项目模板(vanner tl --help)

```sh
## vanner 管理模板库，这个模板会在执行当前init命令时，被列出来供用户作为基准创建一个项目。
vanner tl --help

:' 输出：

管理项目模板，执行init时，可根据此模板创建项目（项目模板只能是一个git仓库）

Options:
  -h, --help      display help for command

Commands:
  add             添加一个项目模板
  del             删除一个项目模板
  list            查看模板列表
  help [command]  display help for command
'

## 根据指引来创建一个模板
vanner tl add

## 根据指引来创建一个或多个模板
vanner tl del

## 查看模板列表
vanner tl list
```

9. 根据官方或自定义的模板初始化一个项目(vanner init --help)

```sh
## vanner 会在 tl 命令时，管理一个模板，这个模板会在执行当前init命令时，被列出来供用户作为基准创建一个项目。
vanner init --help

:' 输出：

基于tl创建的模板仓库，创建一个项目

Options:
  -h, --help  display help for command
'
## 根据指引来创建一个项目
vanner init
```

10. 提交本地代码至 Git 仓库(vanner push --help)

```sh
vanner push --help

:' 输出：

将本地代码提交至远程仓库

Options:
  -t --tag    推送时，是否添加tag(取package.json中的version字段)
  -h, --help  display help for command
'

## 根据指引选择提交时的文件信息来推送远程仓库
vanner push

## 推送时，如果需要创建标签并推送，可携带 -t 或 --tag 参数，作为标识。
## 注意：只有在当前分支被包含在 "管理脚手架的配置信息" 参数中的 main_branch 才会推送。（tag_security用于控制是否需要着这条规则）

vanner push -t
# 或
vanner push --tag
```

11. 管理当前仓库的标签版本信息(vanner tag --help)

```sh
vanner tag --help

:' 输出：

仓库版本号管理

Options:
  -h, --help      display help for command

Commands:
  add             基于当前分支创建一个tag（会根据配置参数中的 tag_security 及 main_branch两个值来前置校验当前分支）
  list            查看当前仓库的版本号列表
  help [command]  display help for command
'

## 基于当前分支创建一个tag（会根据配置参数中的 tag_security 及 main_branch两个值来前置校验当前分支）
vanner tag add

查看当前仓库的版本号列表
vanner tag list
```

11. 管理当前仓库的远程提交源信息(vanner remote --help)

```sh
vanner remote --help

:' 输出：

仓库远程地址管理

Options:
  -h, --help      display help for command

Commands:
  add             给当前项目仓库添加一个远程地址，如果还未初始化git仓库，则初始化仓库后添加远程地址
  del             删除当前项目仓库的远程地址
  list            查看当前项目仓库的远程地址
  help [command]  display help for command
'

## 根据操作指引添加一个远程地址（在无git的项目同步代码非常有用）
vanner remote add

## 根据操作删除一个远程地址
vanner remote del

## 查看远程指引的列表（提示：在当前仓库无远程地址时，输出值为空）
vanner remote list
```
