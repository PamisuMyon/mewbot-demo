import { Message } from "mewbot";
import { IBot, NoConfidence, Replied, Replier, ReplyFailed, ReplyResult, TestInfo, TestParams } from "../../../bot/index.js";
import { Util } from "../../commons/utils.js";
import { Character, ICharacter } from "../../models/ak/character.js";

export class OperatorReplier extends Replier {

    type = 'wiki/character';
    isFuzzy = false;

    constructor(isFuzzy: boolean) {
        super();
        this.isFuzzy = isFuzzy;
    }

    async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        if (options.isCommandMode) return NoConfidence; // 暂不支持指令模式
        let char;
        if (this.isFuzzy) {
            char = await Character.findFuzzyOne('name', msg.content);
        } else {
            char = await Character.findOne({ name: msg.content });
        }
        if (char) {
            return { confidence: this.isFuzzy? .9 : 1, data: char };
        } else return NoConfidence;
    }

    async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        if (!test.data) return ReplyFailed;
        const char = test.data as ICharacter;
        let reply = '';
        if (char.itemDesc) {
            reply += '📄' + char.name + Util.getRarityText(char.rarity) + '\n';
            if (char.itemUsage)
                reply += char.itemUsage + '\n';
            reply += char.itemDesc;
        }
        else {
            if (char.description) {
                const desc = Util.removeLabel(char.description);
                if (desc) {
                    reply += '📃' + char.name + Util.getRarityText(char.rarity) + '\n';
                    reply += desc;
                }
            } else if (char.name) {
                reply += '📃' + char.name + Util.getRarityText(char.rarity) + '\n';
                reply += '暂无相关描述。';
            }
        }
        if (reply) {
            await bot.replyText(msg, reply);
            return Replied;
        }
        return ReplyFailed;
    }
    
}
