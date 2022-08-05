import { logger, User } from "mewbot";
import { FileUtil } from "./file-util.js";
import { Spam } from "./spam.js";

/**
 * 用来避免短时间内被频繁刷屏，例如两个bot互相回复陷入死循环
 */
export class Defender {

    protected _spam: Spam;
    protected _blockList!: Array<Partial<User>>;
    // 实际使用中建议用数据库形式实现
    protected _filePath = './storage/block-list.json';

    /**
     * @param interval 连击生效间隔
     * @param threshold 防御连击阈值
     */
    constructor(interval = 1000, threshold = 10) {
        this._spam = new Spam(interval, threshold);
    }

    async init() {
        // 读取屏蔽用户列表
        const raw = await FileUtil.read('./storage/block-list.json');
        if (raw) {
            this._blockList = JSON.parse(raw.toString()) as Array<Partial<User>>;
        }
        if (!this._blockList)
            this._blockList = [];
    }

    record(user: User) {
        this._spam.record(user.id);
        if (!this._spam.check(user.id).pass) {
            this.addToBlockList(user);
        }
    }

    isBlocked(user_id: string) {
        return this._blockList.find(v => v.id == user_id) != undefined;
    }

    async addToBlockList(user: User) {
        this._blockList.push({
            id: user.id,
            username: user.username,
            name: user.name,
        });
        await FileUtil.write(this._filePath, JSON.stringify(this._blockList));
        logger.debug(`User added to block list: ${user.name} @${user.username}`);
    }

}