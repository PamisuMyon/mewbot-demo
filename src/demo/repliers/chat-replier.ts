import { Message } from "mewbot";
import { Replier, IBot, ReplyResult, Util, TestInfo, TestParams, NoConfidence, FullConfidence, Replied } from "mewbot";


export class ChatReplier extends Replier {

    type = 'chat';

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        // 群聊指令模式下不回复
        if (options.isCommandMode) return NoConfidence;
        // 其他情况下作为Fallback回复器，需要将ChatReplier放在回复器集合的最后（优先级最低）
        return FullConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        if (!msg.content) {
            bot.replyText(msg, `你好，${msg._author.name}`);
            return Replied;
        }            
        if (!await this.checkAvailable(bot, msg)) {
            return Replied;
        }
        let content: string;
        
        const r = msg.content.match(/🍅/g);
        if (r) {
            content = new Array(r.length + 1).join('🥕');
        } else {
            content = Util.randomItem(bot.config.hints.fallback);
        }
        await bot.replyText(msg, content);
        return Replied;
    }

}
