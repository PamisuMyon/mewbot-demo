import { logger, User } from "mewbot";
import { IStorage } from "./istorage.js";
import { Account, BotConfig, defaultConfig } from "../config.js";
import { FileUtil } from "../commons/file-util.js";


export class FileStorage implements IStorage {

    protected _accountPath = './storage/account.json';
    protected _configPath = './storage/config.json';
    protected _blockListPath = './storage/block-list.json';
    protected _config!: Required<BotConfig>;
    get config(): Required<BotConfig> { return this._config; }
    protected _blockList!: Array<Partial<User>>;
    get blockList() { return this._blockList; }

    protected async readFile(path: string, log = true) {
        if (!(await FileUtil.exists(path))) {
            if (log)
                logger.error(`${path} not found.`);
            return;
        }
        const raw = (await FileUtil.read(path))?.toString();
        try {
            return JSON.parse(raw!) as Account;
        } catch(err) {
            if (log)
                logger.error(`${path}: incorrect format.`);
        }
        return;
    }

    async getAccount() {
        const account = await this.readFile(this._accountPath);
        if (!account) return;
        if (account.token || (account.username && account.password)) {
            return account;
        } else {
            logger.error('Cannot find a valid account in account.json');
        }
        return;
    }

    async refreshConfig() {
        this._config = await this.readFile(this._configPath, false) as Required<BotConfig>;
        if (!this._config) {
            logger.info(`Read ${this._configPath} failed, using default config.`);
        }
        this._config = {
            ...defaultConfig,
            ...this._config,
        };
        return this._config;
    }

    async refreshBlockList() {
        this._blockList = await this.readFile(this._blockListPath, false) as Array<Partial<User>>;
        if (!this._blockList)
            this._blockList = [];
        return this._blockList;
    }

    async updateBlockList(blockList: Partial<User>[]) {
        await FileUtil.write(this._blockListPath, JSON.stringify(blockList));
        this._blockList = blockList;
    }

}
