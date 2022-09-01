import { Message } from "mewbot";
import { FullConfidence, IBot, NoConfidence, Replied, Replier, ReplyResult, TestInfo, TestParams } from "../../bot/index.js";
import { Sentence } from "../models/sentence.js";

export class HelpReplier extends Replier {

    type = 'help';
    protected _regex = /^(帮助|help)$/i;

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        if (this._regex.test(msg.content)) return FullConfidence;
        else return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        if (!msg._isDirect && !await this.checkAvailable(bot, msg, false)) {
            await bot.replyText(msg, Sentence.getRandomOne('helpHint')!);
            return Replied;
        }

        await bot.replyText(msg, Sentence.getRandomOne('help')!);
        await bot.replyThought(msg, Sentence.getRandomOne('helpThought')!);
        return Replied;
    }

}