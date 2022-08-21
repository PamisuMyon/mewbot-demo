import { AuthMode, Message } from "mewbot";
import { Replier, IBot, ReplyResult, Util, TestInfo, TestParams, NoConfidence, FullConfidence, Replied } from "../../bot/index.js";

export class KudosReplier extends Replier {

    type = 'kudos';

    protected _regex = /(给)?猫猫加油/;
    protected _roles = [
        '😸', '🤖', '🌰', '🐯', '🐶', 
        '🐵', '🥵', '🍄', '👻', '🍔', 
        '😎', '😈', '⭐', '🌝', '🐱‍👤',
    ];
    protected _effects = ['💥', '💦', '⚡', '✨', '🎉'];

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        if (this._regex.test(msg.content)) return FullConfidence;
        else return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        if (!await this.checkAvailable(bot, msg)) {
            return Replied;
        }

        const result = await this.addKudos(bot, 0);
        let reply: string;
        if (result.data) {
            reply = `💪${Util.randomItem(this._roles)}🤜${Util.randomItem(this._effects)}${result.data.kudos}！`;
        } else {
            reply = '给猫猫加油失败😿';
        }
        await bot.replyText(msg, reply);
        return Replied;
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
