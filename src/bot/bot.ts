import { logger, Message, MewClient, OutgoingMessage, Result, User } from "mewbot";
import { Defender } from "./commons/defender.js";
import { utils } from "./commons/utils.js";
import { getAccount } from "./config/account.js";
import config, { MesageReplyMode } from "./config/config.js";
import { IBot } from "./ibot.js";
import { ChatReplier } from "./repliers/chat-replier.js";
import { CrashReplier } from "./repliers/crash-replier.js";
import { DiceReplier } from "./repliers/dice-replier.js";
import { BaseReplier, ReplyAction } from "./repliers/replier.js";
import { MewReplier } from "./repliers/mew-replier.js";
import { PictureReplier } from "./repliers/picture-replier.js";
import { KudosReplier } from "./repliers/kudos-replier.js";
import { MaxContentLength } from "./constants.js";

export class Bot implements IBot {
    protected _client = new MewClient();
    get client(): MewClient { return this._client; }
    protected _msgQueue = new Array<Message>();
    protected _me!: User;
    protected _names!: Array<string>;
    protected _atRegex!: RegExp;
    protected _defender!: Defender;
    protected _repliers: Array<BaseReplier> = [
        new DiceReplier(),
        new MewReplier(),
        new CrashReplier(),
        new PictureReplier(),
        new KudosReplier(),
        new ChatReplier(),
    ];

    /**
     * 启动
     */
    async launch() {
        // 登录授权
        const account = getAccount();
        if (!account) return;
        if (account.token) {
            this._client.setToken(account.token);
            logger.debug('Authorization token set.');
        } else if (account.username && account.password) {
            const auth = await this._client.login(account.username, account.password);
            if (auth.data) {
                logger.debug('Logged in.');
            } else {
                logger.error('Login failed.');
                return;
            }
        } else return;

        // 获取自身信息
        const me = await this._client.getMeInfo();
        if (me.data) {
            this._me = me.data;
        } else {
            logger.error('Get self info failed.');
            return;
        }
        this.initNames();

        // 初始化防御机制
        this._defender = new Defender(config.defender.interval, config.defender.threshold);
        await this._defender.init();

        // 初始化所有回复器
        this.initRepliers();
        
        // 订阅消息事件
        this._client.on('message_create', data => {
            this._msgQueue.push(data);
        });
        // 开启消息处理
        setInterval(() => this.processMessages(), config.messageProcessInterval);

        // 开启连接
        this._client.connect({ subcriptionNodes: config.nodes })
    }

    /**
     * 初始化名称，用于识别@ 消息
     */
    protected initNames() {
        this._names = new Array<string>();
        this._names.push(this._me.username);
        if (config.triggers.name)
            this._names.push(this._me.name);
        if (config.triggers.alias)
            this._names.push(...config.alias);
        this._atRegex = new RegExp(`[@＠](${this._names.join('|')})`, 'g');
        logger.debug(this._atRegex);
    }

    /**
     * 初始化所有回复器
     */
    protected initRepliers() {
        for (const replier of this._repliers) {
            replier.init();
        }
    }

    /**
     * 处理消息队列
     */
    protected processMessages() {
        if (this._msgQueue.length == 0) {
            return;
        }
        const msg = this._msgQueue.shift() as Message;
        (async ()=> this.doProcessMessage(msg))();
    }

    /**
     * 处理单条消息
     */
    protected async doProcessMessage(msg: Message) {
        // 用户在屏蔽列表中，返回
        if (this._defender.isBlocked(msg._author.id)) {
            logger.debug(`Message from blocked user: ${msg._author.name} @${msg._author.username}`);
            return;
        }

        // 判断是否符合回复条件
        if (msg._isDirect) {    // 私聊
            // 配置不回复私聊，返回
            if (!config.replyDM) return;
            // 忽略私聊中由自己发出的消息
            if (msg._author.id == this._me.id) return;
        } else {    // 群聊
            // 不在配置中的话题（节点），返回
            if (!Reflect.has(config.topics, msg.topic_id)) return;
            // 没有文本内容，返回
            if (!msg.content) return;
            // 判断是否触发
            let isTriggered = false;
            // 回复功能触发
            if (config.triggers.reply) {
                isTriggered = this.isReplyMe(msg);
            } 
            // @bot触发
            if (!isTriggered && msg.content.search(this._atRegex) != -1) {
                isTriggered = true;
                this._atRegex.lastIndex = 0;
            }
            // 未被触发，返回
            if (!isTriggered) return;
            msg.content = msg.content.replace(this._atRegex, '').trim();
            this._atRegex.lastIndex = 0;
        }

        // 执行回复
        for (const replier of this._repliers) {
            const result = await replier.reply(this, msg);

            if (result.action == ReplyAction.Abort)
                return;
            if (result.action == ReplyAction.Pass)
                continue;
            if (result.action == ReplyAction.Replied) {
                // ...额外处理逻辑
                // 记录到Defender
                this._defender.record(msg._author);
                // 是否需要撤回
                if (result.recall?.messageId) {
                    await utils.sleep(result.recall.delay);
                    await this.client.deleteMessage(result.recall.messageId);
                }
                return;
            }
        }
    }

    /**
     * 判断是否是回复我的消息（暂时在表层实现，之后需要挪到mewbot中）
     * @param msg 消息
     */
    protected isReplyMe(msg: Message) {
        if (msg._otherUsers.length == 0) return false;
        if (!msg.reply_to_message_id) return false;
        // 作者不是我 且 相关用户信息中有我
        for (const user of msg._otherUsers) {
            if (user.id == this._me.id) return true;
        }
        return false;
    }

    /**
     * 生成 @对方 文本
     * @param msgToReply 要回复的消息
     */
    protected getReplyTitle(msgToReply: Message) {
        let title = ''
        if (msgToReply._isDirect) return title;
        // 群聊中可以回复来自自己的消息
        // 为了避免陷入死循环，对方名称含有bot名时不能加上@对方名
        if (this._names.indexOf(msgToReply._author.name) != -1
            || msgToReply._author.name.search(this._atRegex) != -1) {
            if (this._names.indexOf(msgToReply._author.username) != -1)
                return title;
            else
                return `@${msgToReply._author.username} `;
        }
        return `@${msgToReply._author.name} `;
    }

    /**
     * 根据当前回复模式，获取要回复的消息id
     * @param to 待回复的消息 
     * @param messageReplyMode 回复模式
     */
    protected getReplyMessageId(to: Message, messageReplyMode?: MesageReplyMode) {
        messageReplyMode = messageReplyMode || config.messageReplyMode;
        if (messageReplyMode == MesageReplyMode.Always) {
            return to.id;
        } else if (messageReplyMode == MesageReplyMode.Derivative) {
            if (to.reply_to_message_id)
                return to.id;
        }
        return;
    }

    async reply(to: Message, message: OutgoingMessage, messageReplyMode?: MesageReplyMode) {
        message.replyToMessageId = this.getReplyMessageId(to, messageReplyMode);
        return await this._client.sendMessage(to.topic_id, message);
    }

    async replyText(to: Message, content: string, messageReplyMode?: MesageReplyMode) {
        const replyToMessageId = this.getReplyMessageId(to, messageReplyMode);
        // 只要使用了回复功能，就无需加上@对方
        if (!replyToMessageId)
            content = this.getReplyTitle(to) + content;
        if (content.length > MaxContentLength) {
            return (await this._client.sendTextMessageSafely(to.topic_id, content, replyToMessageId))[0];
        } else {
            return await this._client.sendTextMessage(to.topic_id, content, replyToMessageId);
        }
    }

    async replyImage(to: Message, imageFile: string, messageReplyMode?: MesageReplyMode) {
        const replyToMessageId = this.getReplyMessageId(to, messageReplyMode);
        return await this._client.sendImageMessage(to.topic_id, imageFile, replyToMessageId);
    }

}
