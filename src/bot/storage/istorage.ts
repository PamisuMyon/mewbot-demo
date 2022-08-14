import { User } from "mewbot";
import { Account, BotConfig } from "../config.js";

export interface IStorage {

    getAccount(): Promise<Account | undefined>;

    refreshConfig(): Promise<Required<BotConfig>>;

    get config(): Required<BotConfig>;

    refreshBlockList(): Promise<Array<Partial<User>>>;

    updateBlockList(blockList: Array<Partial<User>>): Promise<void>;

    get blockList(): Array<Partial<User>>;
}
