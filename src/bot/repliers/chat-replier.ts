import { MessageCreateData } from "mewbot";
import { utils } from "../commons/utils.js";
import config from "../config/config.js";
import { IBot } from "../ibot.js";
import { IReplier, ReplyAction, ReplyResult } from "./ireplier.js";


export class ChatReplier implements IReplier {
    type = 'chat';

    async reply(bot: IBot, msg: MessageCreateData): Promise<ReplyResult> {
        if (!msg.content) {
            bot.replyText(msg, `你好，${msg._user?.name}`);
            return { action: ReplyAction.Replied };
        }            
        if (await bot.isReplierForbidden(msg, this.type)) {
            return { action: ReplyAction.Replied };
        }
        await bot.replyText(msg, utils.randomItem(config.hints.fallback));
        return { action: ReplyAction.Replied };
    }

}
