import { logger } from "mewbot";
import { BotConfig, FileStorage, FileUtil } from "../bot/index.js";
import { demoBotConfig } from "./config.js";

export class DemoStorage extends FileStorage {

    async refreshConfig() {
        this._config = await FileUtil.readJson(this._configPath, false) as Required<BotConfig>;
        if (!this._config) {
            logger.info(`Read ${this._configPath} failed, using default config.`);
        }
        this._config = {
            ...demoBotConfig,
            ...this._config,
        };
        return this._config;
    }
}
