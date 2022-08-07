import { Message } from "mewbot";
import { Spam } from "../commons/spam.js";
import { utils } from "../commons/utils.js";
import config from "../config/config.js";
import { IBot } from "../ibot.js";

/**
 * 对消息的处理行为
 */
export enum ReplyAction {
    Abort,  // 终止
    Pass,   // 跳过当前
    Replied,  // 已回复
}

/**
 * 回复结果
 */
export interface ReplyResult {
    action: ReplyAction;    // 行为
    recall?: {  // 是否需要撤回
        messageId: string;
        delay: number;
    }
}

export abstract class BaseReplier {

    abstract type: string;
    protected _spams: { [topicId: string]: Spam } = {};

    init() {
        for (const key in config.topics) {
            if (!config.topics[key].repliers[this.type])
                continue;
            const spamConfig = config.topics[key].repliers[this.type].spam;
            if (!spamConfig)
                continue;
            const spam = new Spam(spamConfig.interval, spamConfig.threshold, spamConfig.cooldown);
            this._spams[key] = spam;
        }
    }

    protected getConfig(topic_id: string) {
        if (config.topics[topic_id])
            return config.topics[topic_id].repliers[this.type];
    }

    /**
     * 判断功能在话题（节点）中是否可用
     */
    protected async checkAvailable(bot: IBot, msg: Message, shouldReply = true): Promise<boolean> {
        const conf = this.getConfig(msg.topic_id);
        if (!conf) {
            if (shouldReply) {
                // 回复提示文本
                await bot.replyText(msg, utils.randomItem(config.hints.replierUnavailable));
            }
            return false;
        }
        return true;
    }

    protected checkSpam(topic_id: string, targetId: string) {
        const spam = this._spams[topic_id];
        if (spam) {
            return spam.check(targetId);
        }
        return { pass: true };
    }

    protected recordSpam(topic_id: string, targetId: string) {
        const spam = this._spams[topic_id];
        if (spam)
            spam.record(targetId);
    }

    abstract reply(bot: IBot, msg: Message): Promise<ReplyResult>;

}

export abstract class SubReplier {
    abstract test(msg: Message): Promise<SubReplyTestResult>;

    abstract reply(bot: IBot, msg: Message, data?: any): Promise<ReplyResult>;
}

export interface SubReplyTestResult {
    confidence: number;
    data?: any;
    replierIndex?: number;
}

export abstract class PrimaryReplier extends BaseReplier {
    
    abstract type: string;

    protected _subRepliers!: Array<SubReplier>;
    protected _replierPickFunc = this.pick01;

    async reply(bot: IBot, msg: Message): Promise<ReplyResult> {
        if (!msg.content) {
            return { action: ReplyAction.Pass };
        }
        // 从所有SubReplier中选择最合适的
        const t = await this._replierPickFunc(msg);
        if (t) {
            // 功能在此话题是否可用
            if (!await this.checkAvailable(bot, msg))
                return { action: ReplyAction.Replied };

            // 是否冷却中
            const spamCheck = this.checkSpam(msg.topic_id, msg.topic_id);
            if (!spamCheck.pass) {
                if (spamCheck.failedTimes! <= 1) {
                    await bot.replyText(msg, '指令冷却中，请稍后再试');
                    return { action: ReplyAction.Replied };
                } else {
                    const hint = await bot.replyText(msg, `指令冷却中，请${spamCheck.remain! / 1000}后再试`);
                    if (hint.data) {
                        return { 
                            action: ReplyAction.Replied, 
                            recall: { messageId: hint.data.id, delay: 2000 } 
                        };
                    } else {
                        return { action: ReplyAction.Replied };
                    }
                }
            }
            
            // 执行子回复器
            const replier = this._subRepliers[t.replierIndex as number];
            const result = await replier.reply(bot, msg, t.data);
            
            if (result.action == ReplyAction.Replied) {
                // 记录Spam
                this.recordSpam(msg.topic_id, msg.topic_id);
            }

            return result;
        }
        return { action: ReplyAction.Pass };
    }

    protected async pick01(msg: Message) {
        for (let i = 0; i < this._subRepliers.length; i++) {
            const t = await this._subRepliers[i].test(msg);
            if (t.confidence == 1) {
                t.replierIndex = i;
                return t;
            }
        }
        return;
    }

    protected async pick(msg: Message) {
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
