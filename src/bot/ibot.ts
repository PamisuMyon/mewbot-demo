import { Message, MewClient, OutgoingMessage, Result } from "mewbot";
import { BotConfig, MesageReplyMode } from "./config.js";
import { Replier, ReplierPickFunction } from "./replier.js";
import { IStorage } from "./storage/istorage.js";

/**
 * Bot接口，用来定义Bot需要对外提供的接口
 */
export interface IBot {

    /**
     * MewClient
     */
    get client(): MewClient;

    /**
     * 存储
     */
    get storage(): IStorage;

    /**
     * 配置
     */
    get config(): Required<BotConfig>;

    /**
     * 启动
     */
    launch(): Promise<void>;

    /**
     * 刷新，应刷新配置与所有回复器等
     */
    refresh(): Promise<void>;

    /**
     * 回复消息
     * @param to 待回复消息
     * @param message 消息
     * @param messageReplyMode 回复模式，默认使用配置值
     */
    reply(to: Message, message: OutgoingMessage, messageReplyMode?: MesageReplyMode): Promise<Result<Message>>;

    /**
     * 回复文本消息
     * @param to 待回复消息
     * @param reply 文本
     * @param messageReplyMode 回复模式，默认使用配置值
     */
    replyText(to: Message, reply: string, messageReplyMode?: MesageReplyMode): Promise<Result<Message>>;

    /**
     * 回复图片消息
     * @param to 待回复消息
     * @param imageFile 图片文件路径
     * @param messageReplyMode 回复模式，默认使用配置值
     */
    replyImage(to: Message, imageFile: string, messageReplyMode?: MesageReplyMode): Promise<Result<Message>>;
    
}

/**
 * bot初始化选项
 */
export interface InitOptions {
    /**
     * 存储，默认为{@link FileStorage}
     */
    storage?: IStorage;
    /**
     * 回复器列表，回复器位置越前，优先级越高
     */
    repliers?: Replier[];
    /**
     * 回复器挑选函数
     * 
     * 内置实现参照 {@link Replier.pick01}（默认）, {@link Replier.pick} 
     */
    replierPickFunction?: ReplierPickFunction;
}
