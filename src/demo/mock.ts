import { Message, logger, LogLevel } from 'mewbot';
import * as readline from 'readline';
import { MewBot, MesageReplyMode } from 'mewbot';
import { ChatReplier } from './repliers/chat-replier.js';
import { DiceReplier } from './repliers/dice-replier.js';
import { KudosReplier } from './repliers/kudos-replier.js';
import { MewReplier } from './repliers/mew-replier.js';
import { PictureReplier } from './repliers/picture-replier.js';
import { DemoStorage } from './storage.js';

class MockBot extends MewBot {
    
    protected override _storage = new DemoStorage();
    protected override _repliers = [
        new DiceReplier(),
        new MewReplier(),
        new PictureReplier(),
        new KudosReplier(),
        new ChatReplier(),
    ];

    override async replyText(to: Message, content: string, messageReplyMode?: MesageReplyMode) {
        logger.debug(`Message: ${to.content}  Reply Text: ${content}`);
        if (to._author)
            this._defender.record(to._author);
        return { data: { id: 'somefakeid' } as Message };
    }

    addMockMessage(msg: any) {
        this._msgQueue.push(msg);
    }
}

async function consoleTest() {
    logger.logLevel = LogLevel.Debug;
    const bot = new MockBot();
    await bot.launch();

    let isDm = false;
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.on('line', (s) => {
        if (s == 'dm') {
            isDm = !isDm;
            logger.debug('Is DM: ' + isDm);
        } else {
            const msg = {
                id: '1123466296112321218477273662619293872',
                author_id: 'ddd',
                node_id: 'not_a_robot',
                topic_id: '222154400563036161',
                media: [],
                objects: {},
                content: s,
                _isDirect: isDm,
                _media: [],
                _author: {
                    id: 'ddd',
                    username: 'DDD',
                    name: '蒂蒂蒂',
                },
                _otherUsers: [],
            };
            bot.addMockMessage(msg);
        }
    });
}

consoleTest().then();
