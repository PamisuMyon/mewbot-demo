import { GachaInst } from "../functions/gacha/gacha.js";
import { Sentence } from "../models/sentence.js";


export class Task {
    static async refreshAllCache() {
        // await bdCore.init();
        await Sentence.refresh();
        await GachaInst.refresh();
    }
}
