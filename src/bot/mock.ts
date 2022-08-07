import { Message, logger, LogLevel } from 'mewbot';
import * as readline from 'readline';
import { Bot } from './bot.js';

class MockBot extends Bot {
    
    override async replyText(msgToReply: Message, reply: string) {
        logger.debug('Reply:' + reply);
        if (msgToReply._user)
            this._defender.record(msgToReply._user);
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
                topic_id: '219353468583456768',
                media: [],
                objects: {},
                content: s,
                _isDirect: isDm,
                _media: [],
                _user: {
                    id: 'ddd',
                    username: 'DDD',
                    name: '蒂蒂蒂',
                }
            };
            bot.addMockMessage(msg);
        }
    });
}

consoleTest().then();
