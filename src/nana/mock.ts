import { Message, logger, LogLevel, OutgoingMessage, Result } from 'mewbot';
import * as readline from 'readline';
import { MesageReplyMode } from '../bot/index.js';
import { AkDataImporter } from './functions/gamedata/ak-data-importer.js';
import { NanaBot } from './nanabot.js';

class MockBot extends NanaBot {
    
    override async reply(to: Message, message: OutgoingMessage, messageReplyMode?: MesageReplyMode | undefined): Promise<Result<Message>> {
        logger.debug(`Message: ${to.content}  Reply:`);
        logger.dir(message);
        if (to._author)
            this._defender.record(to._author);
        return { data: { id: 'somefakeid' } as Message };
    }

    override async replyText(to: Message, content: string, messageReplyMode?: MesageReplyMode) {
        logger.debug(`Message: ${to.content}  Reply Text: ${content}`);
        if (to._author)
            this._defender.record(to._author);
        return { data: { id: 'somefakeid' } as Message };
    }

    async replyImage(to: Message, imageFile: string, messageReplyMode?: MesageReplyMode) {
        logger.debug(`Message: ${to.content}  Reply Image: ${imageFile}`);
        if (to._author)
            this._defender.record(to._author);
        return { data: { id: 'somefakeid' } as Message };
    }

    addMockMessage(msg: any) {
        this._msgQueue.push(msg);
    }
}

const proxy = 'http://localhost:7890';

async function consoleTest() {
    logger.logLevel = LogLevel.Debug;
    const bot = new MockBot();
    await bot.launch();

    let isDm = false;
    const rl = readline.createInterface(process.stdin, process.stdout);
    rl.on('line', async (s) => {
        if (s == 'dm') {
            isDm = !isDm;
            logger.debug('Is DM: ' + isDm);
        } else if (s == 'update') {
            logger.debug('Updating data.');
            await AkDataImporter.updateAll(proxy);
            logger.debug('Data updated.');
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

consoleTest();
