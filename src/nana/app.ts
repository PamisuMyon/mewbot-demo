import { NanaBot } from "./nana-bot.js";

(async () => {
    const nana = new NanaBot();
    await nana.launch();
})();
