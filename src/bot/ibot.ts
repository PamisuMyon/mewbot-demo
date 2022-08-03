import { Message, MessageCreateData, MewClient, Result } from "mewbot";

/**
 * Bot接口，主要用来定义一些Bot需要对外提供的接口，对Bot内部实现没有太多约束
 */
export interface IBot {
    get client(): MewClient;

    launch(): Promise<void>;

    isReplierForbidden(msg: MessageCreateData, type: string, shouldReply?: boolean): Promise<boolean>;

    replyText(msgToReply: MessageCreateData, reply: string): Promise<Result<Message>>;

}
