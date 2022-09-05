// MewBot快速上手

import { logger, LogLevel, Replier, MewBot, IBot, Message, ReplyResult, TestInfo, TestParams, NoConfidence, FullConfidence, Replied, InitOptions } from "mewbot";
logger.logLevel = LogLevel.Debug;

// 1. 在`项目根目录/storage`文件夹下创建`account.json`，参考`account.sample.json`格式

// 2. 在`项目根目录/storage`文件夹下创建`config.json`，可将`config.sample.json`复制一份改名。

// 3. 编写回复器
class TomatoReplier extends Replier {
    // 3.1. 回复器类型，与bot配置文件中的`repliers`对应，当`repliers`中包含`all`时，默认启用所有功能
    type = 'tomato';

    // 3.2. 回复器测试，此方法中对消息进行预处理，返回相应的置信度与预处理数据
    async test(msg: Message, options: TestParams): Promise<TestInfo> {
        // 🙅‍无消息内容，返回置信度0
        if (!msg.content) return NoConfidence;
        // 🙆‍消息中包含🍅，返回置信度1
        if (msg.content.indexOf('🍅') != -1) return FullConfidence;
        return NoConfidence;
    }

    // 3.3. 回复消息，此方法中对消息进行回复。当回复器通过测试被选中时，此方法将被调用。
    async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        // 执行回复
        await bot.replyText(msg, '🥕🥕🥕!');
        return Replied;
    }
}

// 4. 初始化选项
const options: InitOptions = {
    repliers: [ 
        new TomatoReplier(),
        // ...添加更多回复器
    ]
};

// 5. 启动
const bot = new MewBot(options);
bot.launch();

// 更多示例请参考demo目录下的示例bot
