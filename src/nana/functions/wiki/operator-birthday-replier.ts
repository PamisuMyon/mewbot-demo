import { Message } from "mewbot";
import { IBot, NoConfidence, Replied, Replier, ReplyResult, TestInfo, TestParams } from "../../../bot/index.js";
import { Handbook } from "../../models/ak/handbook.js";

export class OperatorBirthdayReplier extends Replier {

    type = 'wiki';
    protected _regexes = [
        /(.+?) *　*在?(哪天)?((什么|啥)时候)?的?过?生日/,
    ];

    async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        for (const regex of this._regexes) {
            const r = regex.exec(msg.content);
            if (r) {
                const info = await Handbook.findOne({ name: r[1] });
                if (info && info.birthday)
                    return { confidence: 1, data: info.birthday };
            }
        }
        return NoConfidence;
    }

    async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        await bot.replyText(msg, test.data);
        return Replied;
    }

}
