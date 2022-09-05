# mewbot demo
[![](https://img.shields.io/badge/dynamic/json?color=%234279ea&label=Mew%20Online%20🤖&prefix=%E6%88%90%E5%91%98%20&query=%24.member_count&url=https%3A%2F%2Fapi.mew.fun%2Fapi%2Fv1%2Fnodes%2Fnot_a_robot&labelColor=30549f)](https://mew.fun/n/not_a_robot)

基于[mewbot](https://github.com/PamisuMyon/mewbot)框架构建的面向[Mew Online](https://mew.fun)的示例bot，实现了一些示例功能。

## 使用
### 安装
在Release中下载源码或克隆stable分支，在项目根目录下执行安装：

```sh-session
npm install
```

编译：

```sh-session
tsc --watch false
```

### 配置
在`项目根目录/storage`下创建账号配置文件**account.json**:

```json
{
    "token": "你的Token",
    "username": "或者Mew ID",
    "password": "密码"
}
```

Token与账号密码二选一，推荐使用Token。

[如何取得授权Token](https://github.com/PamisuMyon/mewbot/blob/main/documents/FAQ.md#如何授权)

在[bot/config/config.ts](src/bot/config/config.ts)中修改配置，例如bot名称、部署据点与话题/节点等等，部署在其他据点时，请确保您是目标据点的管理员，或已取得目标据点管理员的同意。

[如何获取据点ID](https://github.com/PamisuMyon/mewbot/blob/main/documents/FAQ.md#如何获取据点ID)

[如何获取话题/节点ID](https://github.com/PamisuMyon/mewbot/blob/main/documents/FAQ.md#如何获取话题节点ID)

### 运行

```sh-session
npm start
```

您可以前往配置中的据点测试效果，如果使用默认配置，请前往[不是机器人](https://mew.fun/n/not_a_robot)据点的`🍄`节点进行测试。
