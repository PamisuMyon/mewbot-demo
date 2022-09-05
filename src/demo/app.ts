import { logger, LogLevel } from "mewbot";
import { MewBot, InitOptions } from "mewbot";
import { ChatReplier } from "./repliers/chat-replier.js";
import { DiceReplier } from "./repliers/dice-replier.js";
import { KudosReplier } from "./repliers/kudos-replier.js";
import { MewReplier } from "./repliers/mew-replier.js";
import { PictureReplier } from "./repliers/picture-replier.js";
import { DemoStorage } from "./storage.js";

logger.logLevel = LogLevel.Debug;
const options: InitOptions = {
    storage: new DemoStorage(),
    repliers: [
        new DiceReplier(),
        new MewReplier(),
        new PictureReplier(),
        new KudosReplier(),
        new ChatReplier(),
    ],
};
const bot = new MewBot(options);
bot.launch();
