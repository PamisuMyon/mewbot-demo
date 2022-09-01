import { MewBot } from "../bot/index.js";
import { ChatReplier } from "../demo/repliers/chat-replier.js";
import { DiceReplier } from "./functions/dice/dice-replier.js";
import { GachaReplier } from "./functions/gacha/gacha-replier.js";
import { HelpReplier } from "./functions/help-replier.js";
import { PictureReplier } from "./functions/picture/picture-replier.js";
import { OcrRecruitReplier } from "./functions/recruit/ocr-recruit-replier.js";
import { TextRecruitReplier } from "./functions/recruit/text-recruit-replier.js";
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
        new PictureReplier(),
        new OcrRecruitReplier(),
        new TextRecruitReplier(),
        new HelpReplier(),
        new OperatorReplier(false),
        new ChatReplier(),
    ];

    override async refresh() {
        await Task.refreshAllCache();
        await super.refresh();
    }

}
