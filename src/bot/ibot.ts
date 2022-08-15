import { Message, MewClient, OutgoingMessage, Result } from "mewbot";
import { BotConfig, MesageReplyMode } from "./config.js";
import { Replier, ReplierPickFunction } from "./replier.js";
import { IStorage } from "./storage/istorage.js";

/**
 * Bot接口，主要用来定义一些Bot需要对外提供的接口，对Bot内部实现没有太多约束
 */
export interface IBot {

    get client(): MewClient;

    get storage(): IStorage;

    get config(): BotConfig;

    launch(): Promise<void>;

    refresh(): Promise<void>;

    reply(to: Message, message: OutgoingMessage, messageReplyMode?: MesageReplyMode): Promise<Result<Message>>;

    replyText(msgToReply: Message, reply: string): Promise<Result<Message>>;

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
    repliers: Replier[];
    /**
     * 回复器挑选函数
     * 
     * 内置实现参照 {@link Replier.pick01}（默认）, {@link Replier.pick} 
     */
    replierPickFunction?: ReplierPickFunction;
}
