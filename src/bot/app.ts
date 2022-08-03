import { logger, LogLevel } from "mewbot";
import { Bot } from "./bot.js";

logger.logLevel = LogLevel.Debug;
const bot = new Bot();
bot.launch().then();
