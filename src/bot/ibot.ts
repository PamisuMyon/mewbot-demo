import { Message, MewClient, OutgoingMessage, Result } from "mewbot";
import { MesageReplyMode } from "./config/config";

/**
 * Bot接口，主要用来定义一些Bot需要对外提供的接口，对Bot内部实现没有太多约束
 */
export interface IBot {
    get client(): MewClient;

    launch(): Promise<void>;

    reply(to: Message, message: OutgoingMessage, messageReplyMode?: MesageReplyMode): Promise<Result<Message>>;

    replyText(msgToReply: Message, reply: string): Promise<Result<Message>>;

    replyImage(to: Message, imageFile: string, messageReplyMode?: MesageReplyMode): Promise<Result<Message>>;
    
}
