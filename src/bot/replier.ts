import { Message } from "mewbot";
import { Spam } from "./spam.js";
import { IBot } from "./ibot.js";
import { utils } from "./commons/utils.js";

/**
 * 回复器测试结果
 */
export interface TestInfo {
    /**
     * 置信度
     */
    confidence: number;
    /**
     * 额外数据
     */
    data?: any;
    /**
     * 当前回复器在所属回复器集合中的下标，由外部设置
     */
    replierIndex?: number;
    /**
     * 测试选项，由外部设置
     */
    options?: TestParams;
}

export const NoConfidence: TestInfo = { confidence: 0 };
export const FullConfidence: TestInfo = { confidence: 1 };

/**
 * 回复结果
 */
export interface ReplyResult {
    /**
     * 是否成功回复
     */
    success: boolean;
    /**
     * 是否需要撤回
     */
    recall?: {
        messageId: string;
        delay: number;
    }
}

export const Replied: ReplyResult = { success: true };
export const ReplyFailed: ReplyResult = { success: false };

/**
 * 测试参数
 */
export interface TestParams {
    isCommandMode: boolean;
    isReplyMe: boolean;
}

/**
 * 回复器挑选函数，用于挑选当前最匹配的回复器
 */
export type ReplierPickFunction = (repliers: Replier[], msg: Message, params: TestParams) => Promise<TestInfo | undefined>;

/**
 * 回复器基类
 */
export abstract class Replier {

    abstract type: string;
    protected _spams: { [topicId: string]: Spam } = {};

    abstract test(msg: Message, options: TestParams): Promise<TestInfo>;

    /**
     * 回复消息
     * @param bot bot 
     * @param msg 待回复的消息
     */
    abstract reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult | undefined>;

    /**
     * 初始化，在bot启动及配置刷新时被调用
     * 
     * @param bot bot
     */
    init(bot: IBot) {
        const config = bot.config;
        // 初始化每个话题的Spam配置
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

    /**
     * 获取当前话题的回复器配置
     * 
     * @param bot bot
     * @param topic_id 话题id
     */
    protected getConfig(bot: IBot, topic_id: string) {
        if (bot.config.topics[topic_id]) {
            if (bot.config.topics[topic_id].repliers[this.type])
                return bot.config.topics[topic_id].repliers[this.type];
            else return bot.config.topics[topic_id].repliers['all'];
        }
    }

    /**
     * 判断回复器在话题（节点）中是否可用
     * @param bot bot
     * @param msg 待回复消息
     * @param shouldReply 不可用时，是否直接回复功能不可用提示
     */
    protected async checkAvailable(bot: IBot, msg: Message, shouldReply = true): Promise<boolean> {
        const conf = this.getConfig(bot, msg.topic_id);
        if (!conf) {
            if (shouldReply) {
                // 回复提示文本
                await bot.replyText(msg, utils.randomItem(bot.config.hints.replierUnavailable));
            }
            return false;
        }
        return true;
    }

    /**
     * 冷却检测
     * @param topic_id 话题id
     * @param targetId 目标id，可以是话题id、用户id
     */
    protected checkSpam(topic_id: string, targetId: string) {
        const spam = this._spams[topic_id];
        if (spam) {
            return spam.check(targetId);
        }
        return { pass: true };
    }

    /**
     * 记录冷却
     * @param topic_id 话题id
     * @param targetId 目标id，可以是话题id、用户id
     */
    protected recordSpam(topic_id: string, targetId: string) {
        const spam = this._spams[topic_id];
        if (spam)
            spam.record(targetId);
    }

    static async pick01(repliers: Replier[], msg: Message, params: TestParams) {
        for (let i = 0; i < repliers.length; i++) {
            const t = await repliers[i].test(msg, params);
            if (t.confidence == 1) {
                t.replierIndex = i;
                return t;
            }
        }
        return;
    }

    static async pick(repliers: Replier[], msg: Message, params: TestParams) {
        const tests = new Array<TestInfo>();
        for (let i = 0; i < repliers.length; i++) {
            const t = await repliers[i].test(msg, params);
            if (t.confidence > 0) {
                t.replierIndex = i;
                tests.push(t);
            }
        }
        if (tests.length != 0) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#sort_stability
            tests.sort((a, b) => b.confidence - a.confidence);
            return tests[0];
        }
        return;
    }

}

export interface MatryoshkaTestInfo extends TestInfo {
    /**
     * 当前回复器在所属回复器集合中的下标，由外部设置
     */
    subReplierIndex?: number;
}

/**
 * 套娃回复器
 */
export abstract class MatryoshkaReplier extends Replier {
    
    abstract type: string;

    protected _children!: Array<Replier>;
    protected _pickFunc = Replier.pick;

    override async test(msg: Message, options: TestParams) {
        if (!msg.content) {
            return NoConfidence;
        }
        const t = await this._pickFunc(this._children, msg, options) as MatryoshkaTestInfo;
        if (t) {
            t.subReplierIndex = t.replierIndex;
            t.replierIndex = -1;
            return t;
        }
        else return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo) {
        // 功能在此话题是否可用
        if (!await this.checkAvailable(bot, msg))
            return;

        // 是否冷却中
        const spamCheck = this.checkSpam(msg.topic_id, msg.topic_id);
        if (!spamCheck.pass) {
            if (spamCheck.failedTimes! <= 1) {
                await bot.replyText(msg, '指令冷却中，请稍后再试');
                return Replied;
            } else {
                const hint = await bot.replyText(msg, `指令冷却中，请${utils.getTimeCounterText(spamCheck.remain! / 1000)}后再试`);
                if (hint.data) {
                    return {
                        success: true,
                        recall: { messageId: hint.data.id, delay: 2000 }
                    };
                } else {
                    return Replied;
                }
            }
        }

        // 执行子回复器
        const info = test as MatryoshkaTestInfo;
        const replier = this._children[info.subReplierIndex as number];
        const result = await replier.reply(bot, msg, info.data);

        if (result?.success) {
            // 记录Spam
            this.recordSpam(msg.topic_id, msg.topic_id);
        }

        return result;
    }

}