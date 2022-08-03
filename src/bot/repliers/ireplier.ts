import { MessageCreateData } from "mewbot";
import { IBot } from "../ibot.js";

/**
 * 消息解析及回复类
 */
export interface IReplier {
    type: string;

    reply(bot: IBot, msg: MessageCreateData): Promise<ReplyResult>;
}

/**
 * 对消息的处理行为
 */
export enum ReplyAction {
    Abort,  // 终止
    Pass,   // 跳过当前
    Replied,  // 已回复
}

export interface ReplyResult {
    action: ReplyAction;
    recall?: {
        messageId: string;
        delay: number;
    }
}

export interface ISubReplier {
    test(msg: MessageCreateData): Promise<SubReplyTestResult>;

    reply(bot: IBot, msg: MessageCreateData, data?: any): Promise<ReplyResult>;
}

export interface SubReplyTestResult {
    confidence: number;
    data?: any;
    replierIndex?: number;
}

export abstract class PrimaryReplier implements IReplier {
    
    abstract type: string;

    protected _subRepliers!: Array<ISubReplier>;
    protected _replierPickFunc = this.pick01;

    async reply(bot: IBot, msg: MessageCreateData): Promise<ReplyResult> {
        if (!msg.content) {
            return { action: ReplyAction.Pass };
        }
        const t = await this._replierPickFunc(msg);
        if (t) {
            if (await bot.isReplierForbidden(msg, this.type))
                return { action: ReplyAction.Replied };
            const replier = this._subRepliers[t.replierIndex as number];
            return await replier.reply(bot, msg, t.data);
        }
        return { action: ReplyAction.Pass };
    }

    protected async pick01(msg: MessageCreateData) {
        for (let i = 0; i < this._subRepliers.length; i++) {
            const t = await this._subRepliers[i].test(msg);
            if (t.confidence == 1) {
                t.replierIndex = i;
                return t;
            }
        }
        return;
    }

    protected async pick(msg: MessageCreateData) {
        const tests = new Array<SubReplyTestResult>();
        for (let i = 0; i < this._subRepliers.length; i++) {
            const t = await this._subRepliers[i].test(msg);
            if (t.confidence > 0) {
                t.replierIndex = i;
                tests.push(t);
            }
        }
        if (tests.length != 0) {
            tests.sort((a, b) => b.confidence - a.confidence);
            return tests[0];
        }
        return;
    }

}
