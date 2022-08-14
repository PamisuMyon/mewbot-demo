import { logger, LogLevel } from "mewbot";
import { Bot, InitOptions } from "../bot/index.js";
import { ChatReplier } from "./repliers/chat-replier.js";
import { CrashReplier } from "./repliers/crash-replier.js";
import { DiceReplier } from "./repliers/dice-replier.js";
import { KudosReplier } from "./repliers/kudos-replier.js";
import { MewReplier } from "./repliers/mew-replier.js";
import { PictureReplier } from "./repliers/picture-replier.js";
import { DemoStorage } from "./storage.js";

logger.logLevel = LogLevel.Debug;
const bot = new Bot();
const options: InitOptions = {
    storage: new DemoStorage(),
    repliers: [
        new DiceReplier(),
        new MewReplier(),
        new CrashReplier(),
        new PictureReplier(),
        new KudosReplier(),
        new ChatReplier(),
    ],
};
bot.init(options);
bot.launch();
