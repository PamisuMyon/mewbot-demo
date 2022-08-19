import { MewBot } from "../bot/index.js";
import { DiceReplier } from "./functions/dice/dice-replier.js";
import { OperatorReplier } from "./functions/wiki/operator-replier.js";
import { MongoStorage } from "./storage.js";

export class NanaBot extends MewBot {

    protected _storage = new MongoStorage();
    protected _repliers = [
        new DiceReplier(),
        new OperatorReplier(false),
    ];

}
