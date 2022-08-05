import { AuthMode, MessageCreateData } from "mewbot";
import { IBot } from "../ibot.js";
import { BaseReplier, ReplyAction, ReplyResult } from "./replier.js";

export class KudosReplier extends BaseReplier {

    type = 'kudos';
    protected _regex = /(给)?猫猫加油/;

    async reply(bot: IBot, msg: MessageCreateData): Promise<ReplyResult> {
        if (!msg.content) {
            return { action: ReplyAction.Pass };
        }
        if (!this._regex.test(msg.content)) {
            return { action: ReplyAction.Pass };
        }
        if (!await this.checkAvailable(bot, msg)) {
            return { action: ReplyAction.Replied };
        }

        const result = await this.addKudos(bot, 0);
        let reply: string;
        if (result.data) {
            reply = `💪😸🤜💥${result.data.kudos}！`;
        } else {
            reply = '给猫猫加油失败😿';
        }
        await bot.replyText(msg, reply);
        return { action: ReplyAction.Replied };
    }

    /**
     * 增加Kudos！
     * @param num 编号 
     */
    async addKudos(bot: IBot, num: number) {
        const url = 'https://api.mew.fun' + `/api/v1/welcome/kudos/${num}`;
        return await bot.client.request<Kudos>(url, { method: 'POST' }, AuthMode.Free);
    }

}

type Kudos = {
    kudos: Record<string, string> | number | string;
}
