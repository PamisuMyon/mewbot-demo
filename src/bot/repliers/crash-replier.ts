import { MessageCreateData } from "mewbot";
import { utils } from "../commons/utils.js";
import { IBot } from "../ibot.js";
import { IReplier, ReplyAction, ReplyResult } from "./ireplier.js";

export class CrashReplier implements IReplier {
    type = 'crash';

    protected _regex = /来点(闪退|崩溃) *　*(\d*)/

    async reply(bot: IBot, msg: MessageCreateData): Promise<ReplyResult> {
        if (!msg.content) {
            return { action: ReplyAction.Pass };
        }
        if (!this._regex.test(msg.content)) {
            return { action: ReplyAction.Pass };
        }
        if (await bot.isReplierForbidden(msg, this.type)) {
            return { action: ReplyAction.Replied };
        }
        const r = this._regex.exec(msg.content);
        let timeout = utils.getNumber(r![2], 100);
        timeout = Math.max(timeout, 100);
        console.log('timeout:' + timeout);
        await bot.replyText(msg, 'iOS闪退测试中，请坐和放宽...');
        await utils.sleep(2000);
        const result = await bot.replyText(msg, '😺😸😹😻😼😽🙀😿😾');
        if (result.data) {
            await utils.sleep(timeout);
            const b = await bot.client.deleteMessage(result.data.id);
            await bot.replyText(msg, b? '测试完毕，请描述您的感受' : '测试失败，猫砂盆已被炸毁');
        }
        return { action: ReplyAction.Replied };
    }

}
