import { Message } from "mewbot";
import { utils } from "../commons/utils.js";
import { IBot } from "../ibot.js";
import { BaseReplier, ReplyAction, ReplyResult } from "./replier.js";

/**
 * 骰娘的本职工作
 */
export class DiceReplier extends BaseReplier {

    type = 'dice';
    isPromise = false;

    protected _regex = /((\d+) ?\+ ?)?((\d*) )?(\d*)d(\d+)( ?\+ ?(\d+))?=?/i;
    protected _errorHints = [
        '指令输入错误，正在倾倒猫猫生发水...',
        '指令输入错误，损失💰MewCoin×1',
        '指令输入错误，猫猫逃走了！',
    ];
    protected _tooManyHints = [
        '一次掷太多啦！',
    ];

    async reply(bot: IBot, msg: Message): Promise<ReplyResult> {
        if (!msg.content) {
            return { action: ReplyAction.Pass };
        }
        if (!this._regex.test(msg.content)) {
            return { action: ReplyAction.Pass };
        }
        if (!await this.checkAvailable(bot, msg)) {
            return { action: ReplyAction.Replied };
        }
        
        const lines = msg.content.split('\n');
        const options = new Array<DiceOptions>();
        for (const line of lines) {
            const r = this._regex.exec(line);
            if (!r) continue;
            const option: DiceOptions = {
                add: utils.getNumber(r[2], 0),
                rounds: utils.getNumber(r[4], 1),
                times: utils.getNumber(r[5], 1),
                dice: utils.getNumber(r[6], 0),
                add2: utils.getNumber(r[8], 0),
            }
            options.push(option);
        }
        let reply = Dice.rolls(options, this._errorHints, this._tooManyHints);
        if (!msg._isDirect && reply.indexOf('\n') != -1) {
            reply = '\n' + reply;
        }

        await bot.replyText(msg, reply);
        return { action: ReplyAction.Replied };
    }

}

interface DiceOptions {
    add: number;        // 前置加数
    rounds: number;     // 掷几轮
    times: number;      // 骰子数
    dice: number;       // 骰子
    add2: number;       // 后置加数
}

class Dice {
    static roll(o: DiceOptions) {
        let result = ''
        if (o.rounds <= 0 || o.times <= 0 || o.dice <= 0) {
            return result;
        } else {
            for (let i = 0; i < o.rounds; i++) {
                let num: number;
                let sum = 0;
                if (o.rounds > 1) {
                    result += `${i + 1} »  `;
                }
                if (o.add != 0) {
                    result += `${o.add}+`;
                }
                result += `${o.times}d${o.dice}`;
                if (o.add2 != 0) {
                    result += `+${o.add2}`;
                }
                result += '=';
                if (o.times == 1) {
                    num = utils.randomInt(1, o.dice)
                    if (o.add != 0 || o.add2 != 0) {
                        if (o.add != 0) {
                            result += `${o.add}+`;
                        }
                        result += num;
                        if (o.add2 != 0) {
                            result += `+${o.add2}`;
                        }
                        sum = o.add + num + o.add2;
                        result += `=${sum}`;
                    } else {
                        result += o.add + num + o.add2;
                    }
                } else {
                    if (o.add != 0) {
                        result += `${o.add}+`;
                    }
                    sum += o.add;
                    for (let j = 0; j < o.times; j++) {
                        num = utils.randomInt(1, o.dice);
                        sum += num;
                        result += num;
                        if (j < o.times - 1) {
                            result += '+';
                        }
                    }
                    if (o.add2 != 0) {
                        result += `+${o.add2}`;
                    }
                    sum += o.add2;
                    result += `=${sum}`;
                }
                if (o.rounds != 1 && i < o.rounds - 1) {
                    result += '\n';
                }
            }
        }
        return result;
    }

    static rolls(options: DiceOptions[],
        errorHints: string[],
        tooManyHints: string[],
        maxRounds = 20,
        maxTimes = 50) {
        const results = new Array<string>();
        for (const o of options) {
            let result = '';
            if (o.rounds <= 0 || o.times <= 0 || o.dice <= 0) {
                result = utils.randomItem(errorHints);
            } else if (o.rounds >= maxRounds || o.times > maxTimes) {
                result = utils.randomItem(tooManyHints);
            } else {
                result = this.roll(o);
            }
            results.push(result);
        }
        let reply = '';
        if (results.length > 1) {
            for (let i = 0; i < results.length; i++) {
                const splits = results[i].split('\n');
                for (let j = 0; j < splits.length; j++) {
                    reply += `${i + 1} ·  `;
                    reply += splits[j];
                    if (j < splits.length - 1) {
                        reply += '\n';
                    }
                }
                if (i < results.length - 1) {
                    reply += '\n';
                }
            }
        } else if (results.length == 1) {
            reply = results[0];
        } else {
            reply = utils.randomItem(errorHints);
        }
        return reply;
    }
}
