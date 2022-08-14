import { logger } from "mewbot";
import { BotConfig, FileStorage } from "../bot/index.js";
import { demoBotConfig } from "./config.js";

export class DemoStorage extends FileStorage {

    async refreshConfig() {
        this._config = await this.readFile(this._configPath, false) as Required<BotConfig>;
        if (!this._config) {
            logger.info(`Read ${this._configPath} failed, using default config.`);
        }
        this._config = {
            ...demoBotConfig,
            ...this._config,
        }
        return this._config;
    }
}
