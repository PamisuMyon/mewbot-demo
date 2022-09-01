import { logger, LogLevel } from "mewbot";
import { NanaBot } from "./nana-bot.js";

(async () => {
    logger.logLevel = LogLevel.Debug;
    const nana = new NanaBot();
    await nana.launch();
})();
