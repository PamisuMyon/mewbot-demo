// 获取据点与其中的话题信息

import { logger, LogLevel, MewClient } from "mewbot";

(async () => {
    const client = new MewClient();
    const result = await client.getNodeInfo('not_a_robot');
    if (result.data) {
        console.dir(result.data);
        for (const topic of result.data.topics) {
            console.log(`${topic.name} : ${topic.id}`);
        }
    } else {
        console.log('获取据点信息失败');
    }
})();

// 授权不是必要的
// 仅在获取私密据点中的话题信息时，需要用户已加入该据点，并设置授权
// client.setToken('你的Token');

// 调整日志等级，打印所有日志（可选）
logger.logLevel = LogLevel.Verbose;
