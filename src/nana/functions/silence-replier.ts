import { Message } from "mewbot";
import { FullConfidence, IBot, NoConfidence, Replied, Replier, ReplyResult, Spam, TestInfo, TestParams } from "../../bot/index.js";
import { Util } from "../commons/utils.js";
import { NanaBotConfig } from "../models/config.js";
import { Sentence } from "../models/sentence.js";

/**
 * 安静指令回复器
 * 
 * 生效时将会抢夺比其优先级低回复器的回复权，不做任何回复直到失效，bot中需要使用类似{@link Replier.pick01}的挑选函数
 */
export class SilenceReplier extends Replier {

    type = 'silence';

    protected _regex = /^安静$/;
    protected _silenceSpams!: { [topicId: string]: Spam };  // hard-code
    protected _silenceDuration!: number;

    override init(bot: IBot) {
        super.init(bot);
        this._silenceSpams = {};
        this._silenceDuration = (bot.storage.config as NanaBotConfig).silenceDuration;
    }

    async test(msg: Message, options: TestParams): Promise<TestInfo> {
        // 检测生效
        if (this._silenceSpams[msg.topic_id]) {
            const check = this._silenceSpams[msg.topic_id].check(msg.topic_id);
            if (!check.pass) {
                return FullConfidence;
            }
        }

        if (!msg.content) return NoConfidence;
        // 检测指令
        if (this._regex.test(msg.content)) {
            let spam;
            if (this._silenceSpams[msg.topic_id]) {
                spam = this._silenceSpams[msg.topic_id];
            } else {
                spam = new Spam(0, 1, this._silenceDuration);
                this._silenceSpams[msg.topic_id] = spam;
            }
            spam.record(msg.topic_id);
            return { confidence: 1, data: 1};
        }
        return NoConfidence;
    }

    async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        if (test.data) {
            let reply = Util.getTimeCounterText(this._silenceDuration / 1000);
            reply = Util.stringFormat(Sentence.getRandomOne('silence')!, reply);
            await bot.replyText(msg, reply);
        }
        return Replied;
    }

}