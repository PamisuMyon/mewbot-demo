// 快速上手，接收并监听据点指定话题消息，回复指定内容的消息

import { logger, LogLevel, MewClient } from "mewbot";

// 订阅据点ID: '不是机器人'
const subcriptionNodes = ['100554577263091712'];
// 监听话题/节点ID: '🍄'
const listenTopics = ['219353468583456768'];

// 创建MewClient并监听事件
const client = new MewClient();
client.on('message_create', async (data) => {
    console.log('接收到消息：');
    console.dir(data);
    // 如果监听话题中收到了含有🍅的消息，则回复🥕
    if (listenTopics.indexOf(data.topic_id) != -1) {
        if (data.content && data.content.indexOf('🍅') != -1)
            await client.sendTextMessage(data.topic_id, '🥕🥕🥕！');
    }
    // *会接收到自己发出的消息，包括私聊
});

// 设置授权Token
client.setToken('你的Token');

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

/*
引入项目的模块时，请使用完整名称（".js"），例如：
import { SomeAwesomeClass } from "./awesome.js";
*/
