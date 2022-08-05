import { logger, Message, MessageCreateData, MewClient, Result, User } from "mewbot";
import { Defender } from "./commons/defender.js";
import { utils } from "./commons/utils.js";
import { getAccount } from "./config/account.js";
import config from "./config/config.js";
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
    protected _msgQueue = new Array<MessageCreateData>();
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
        if (config.allowAt.name)
            this._names.push(this._me.name);
        if (config.allowAt.alias)
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
        const msg = this._msgQueue.shift() as MessageCreateData;
        (async ()=> this.doProcessMessage(msg))();
    }

    /**
     * 处理单条消息
     */
    protected async doProcessMessage(msg: MessageCreateData) {
        // 用户在屏蔽列表中，返回
        if (!msg._user) return;
        if (this._defender.isBlocked(msg._user.id)) {
            logger.debug(`Message from blocked user: ${msg._user.name} @${msg._user.username}`);
            return;
        }

        // 判断是否符合回复条件
        if (msg._isDirect) {    // 私聊
            // 配置不回复私聊，返回
            if (!config.replyDM) return;
            // 忽略私聊中由自己发出的消息
            if (msg._user?.id == this._me.id) return;
        } else {    // 群聊
            // 不在配置中的话题（节点），返回
            if (!Reflect.has(config.topics, msg.topic_id)) return;
            // 没有文本内容，返回
            if (!msg.content) return;
            // 不含@bot名，返回
            if (msg.content.search(this._atRegex) == -1) return;  
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
                this._defender.record(msg._user);
                // 是否需要撤回
                if (result.recall?.messageId) {
                    await utils.sleep(result.recall.delay);
                    await this.client.deleteMessage(result.recall.messageId);
                }
                return;
            }
        }
    }

    protected getReplyTitle(msgToReply: MessageCreateData) {
        let title = ''
        if (msgToReply._isDirect) return title;
        if (!msgToReply._user) return title;
        // 群聊中可以回复来自自己的消息
        // 为了避免陷入死循环，对方名称含有bot名时不能加上@对方名
        if (this._names.indexOf(msgToReply._user.name) != -1
            || msgToReply._user.name.search(this._atRegex) != -1) {
            if (this._names.indexOf(msgToReply._user.username) != -1)
                return title;
            else
                return `@${msgToReply._user.username} `;
        }
        return `@${msgToReply._user.name} `;
    }

    async replyText(msgToReply: MessageCreateData, reply: string) {
        reply = this.getReplyTitle(msgToReply) + reply;
        if (reply.length > MaxContentLength) {
            const replies = new Array<string>();
            while (reply.length != 0) {
                replies.push(reply.slice(0, MaxContentLength))
                reply = reply.slice(MaxContentLength, reply.length);
            }
            return await this.replyTexts(msgToReply, replies, false);
        } else {
            return await this._client.sendTextMessage(msgToReply.topic_id, reply);
        }
    }

    async replyTexts(msgToReply: MessageCreateData, replies: string[], needTitle = true) {
        let result: Result<Message> = { error: { name: 'UnknownError' } };
        if (needTitle) {
            replies[0] = this.getReplyTitle(msgToReply) + replies[0];
        }
        for (let i = 0; i < replies.length; i++) {
            result = await this._client.sendTextMessage(msgToReply.topic_id, replies[i]);
            if (i != replies.length - 1)
                await utils.sleep(200);
        }
        return result;
    }

}
