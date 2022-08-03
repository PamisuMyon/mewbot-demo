// 快速上手

import { logger, LogLevel, MewClient } from "mewbot";

// 订阅据点ID: '不是机器人'
const subcriptionNodes = ['100554577263091712'];

// 创建MewClient并监听事件
const client = new MewClient();
client.on('message_create', data => {
    console.log('接收到消息：');
    console.dir(data);
});

// 开启连接
client.connect({ subcriptionNodes });

// 调整日志等级，打印所有日志（可选）
logger.logLevel = LogLevel.Verbose;

/*
遇到
Error [ERR_REQUIRE_ESM]
SyntaxError: Cannot use import statement outside a module
等问题，请使用ESM，在package.json中加入
  "type": "module"
并在代码中使用
    import { MewClient } from "mewbot";
*/
