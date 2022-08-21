import { Util } from "../../bot/index.js";
import { CachedCol } from "./db.js";

export interface ISentence {
    name: string;
    contents: string[];
}

export class SentenceCol extends CachedCol<ISentence> {

    get(name: string) {
        for (const item of this._cache) {
            if (item.name == name)
                return item.contents;
        }
        return;
    }

    getRandomOne(name: string) {
        const contents = this.get(name);
        if (contents)
            return Util.randomItem(contents);
        return;
    }

}

export const Sentence = new SentenceCol('sentences');
