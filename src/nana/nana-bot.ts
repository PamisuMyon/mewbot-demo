import { MewBot } from "../bot/index.js";
import { DiceReplier } from "./functions/dice/dice-replier.js";
import { GachaReplier } from "./functions/gacha/gacha-replier.js";
import { SilenceReplier } from "./functions/silence-replier.js";
import { OperatorReplier } from "./functions/wiki/operator-replier.js";
import { Task } from "./schedulers/task.js";
import { MongoStorage } from "./storage.js";

export class NanaBot extends MewBot {

    protected _storage = new MongoStorage();
    protected _repliers = [
        new SilenceReplier(),
        new GachaReplier(),
        new DiceReplier(),
        new OperatorReplier(false),
    ];

    override async refresh() {
        await Task.refreshAllCache();
        await super.refresh();
    }

}
