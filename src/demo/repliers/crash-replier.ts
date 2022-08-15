import { Message } from "mewbot";
import { Replier, IBot, ReplyResult, utils, TestInfo, TestParams, NoConfidence, FullConfidence, Replied } from "../../bot/index.js";

export class CrashReplier extends Replier {

    type = 'crash';

    protected _regex = /来点(闪退|崩溃) *　*(\d*)/

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        if (this._regex.test(msg.content)) return FullConfidence;
        else return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult | undefined> {
        if (!await this.checkAvailable(bot, msg)) {
            return Replied;
        }

        let defaultTimeout = 100;
        const config = this.getConfig(bot, msg.topic_id);
        if (config && !isNaN(config.defaultTimeout)) {
            defaultTimeout = config.defaultTimeout;
        }

        const r = this._regex.exec(msg.content!);
        let timeout = utils.getNumber(r![2], defaultTimeout);
        timeout = Math.max(timeout, 100);
        
        await bot.replyText(msg, 'iOS闪退测试中，请坐和放宽...');
        await utils.sleep(2000);
        const result = await bot.replyText(msg, '😺😸😹😻😼😽🙀😿😾');
        if (result.data) {
            await utils.sleep(timeout);
            const b = await bot.client.deleteMessage(result.data.id);
            await bot.replyText(msg, b? '测试完毕，请描述您的感受' : '测试失败，猫砂盆已被炸毁');
        }
        return Replied;
    }

}
