import { Message } from "mewbot";
import { IBot, NoConfidence, Replied, Replier, ReplyResult, TestInfo, TestParams } from "../../../bot/index.js";
import { Handbook } from "../../models/ak/handbook.js";

export class CvOperatorReplier extends Replier {

    type = 'wiki';

    async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        const results = await Handbook.findByCv(msg.content);
        if (results) {
            if (results && results.length > 0) {
                let reply = '';
                for (let i = 0; i < results.length; i++) {
                    reply += results[i].name;
                    if (i != results.length - 1) {
                        reply += '、';
                    }
                }
                if (reply) {
                    reply = `${msg.content}配音的干员：` + reply;
                    return { confidence: 1, data: reply };
                }
            }
        }
        return NoConfidence;
    }

    async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        await bot.replyText(msg, test.data);
        return Replied;
    }

}
