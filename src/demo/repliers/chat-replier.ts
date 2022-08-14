import { Message } from "mewbot";
import { BaseReplier, IBot, ReplyAction, ReplyResult, utils } from "../../bot/index.js";


export class ChatReplier extends BaseReplier {

    type = 'chat';

    async reply(bot: IBot, msg: Message): Promise<ReplyResult> {
        if (!msg.content) {
            bot.replyText(msg, `你好，${msg._author.name}`);
            return { action: ReplyAction.Replied };
        }            
        if (!await this.checkAvailable(bot, msg)) {
            return { action: ReplyAction.Replied };
        }
        let content: string;
        
        const r = msg.content.match(/🍅/g);
        if (r) {
            content = new Array(r.length + 1).join('🥕');
        } else {
            content = utils.randomItem(bot.config.hints.fallback)
        }
        await bot.replyText(msg, content);
        return { action: ReplyAction.Replied };
    }

}
