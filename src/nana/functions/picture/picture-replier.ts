import { logger, LogLevel, Message } from "mewbot";
import got from "got";
import { MatryoshkaReplier, TestInfo, IBot, ReplyResult, Util, FileUtil, NetUtil, Replier, TestParams, FullConfidence, NoConfidence, Replied, MesageReplyMode } from "../../../bot/index.js";
import { Pxkore, PxkoreOptions } from "./pxkore.js";

export class PictureReplier extends MatryoshkaReplier {
    
    override type = 'picture';
    protected override _pickFunc = Replier.pick01;
    protected override _children = [
        new KittySubReplier(),
        new DogeSubReplier(),
        new SetuSubReplier(),
    ];

    override getCooldownHint(remainTime?: number) {
        if (remainTime) {
            return `博士，${Util.getTimeCounterText(remainTime)}后再试吧`;
        } else {
            return '博士一次不要看太多，稍微休息一下吧';
        }
    }
}

abstract class PictureSubReplier extends Replier {
    
    protected _timeout = 8000;
    protected abstract _regexes: RegExp[];
    protected abstract _downloadFuncs: Array<() => Promise<string | undefined>>;
    protected abstract _downloadingHint: string;
    protected abstract _downloadErrorHint: string;
    protected abstract _sendErrorHint: string;

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        for (const regex of this._regexes) {
            const b = regex.test(msg.content as string);
            if (b) return FullConfidence;
        }
        return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        const hint = await bot.replyText(msg, this._downloadingHint);
        const file = await Util.randomItem(this._downloadFuncs)();
        let error;
        if (file) {
            const image = await bot.replyImage(msg, file);
            if (!image.data || !image.data.id) {
                error = this._sendErrorHint;
            } else {
                // 删除缓存文件
                await FileUtil.delete(file);
            }
        } else {
            error = this._downloadErrorHint;
        }
        await Util.sleep(100);
        if (hint.data) {
            await bot.client.deleteMessage(hint.data.id);
        }
        if (error) {
            await bot.replyText(msg, error);
        }
        return Replied;
    }

}

class KittySubReplier extends PictureSubReplier {

    type = 'picture/kitty';

    protected _regexes = [
        /来(点|电|份|张)猫(猫|图)/,
        /來(點|電|份|張)貓(貓|圖)/,
    ];
    protected _downloadingHint = '正在检索猫猫数据库，请博士耐心等待...';
    protected _downloadErrorHint = '图片被猫猫吞噬了，请博士稍后再试。';
    protected _sendErrorHint = '图片发送过程中发生致命错误，您的开水壶已被炸毁。';
    protected _downloadFuncs = [
        () => this.downloadTheCatApi(),
        () => this.downloadRandomCat(),
    ];
    
    async downloadTheCatApi() {
        const url = 'https://api.thecatapi.com/v1/images/search';
        try {
            logger.debug('Downloading the cat api');
            const { body } = await got.get(url, { timeout: { request: this._timeout } });
            const parse = JSON.parse(body);
            const split = parse[0].url.split('/');
            const fileName = split[split.length - 1];
            const filePath = './cache/images/' + fileName;
            const path = await NetUtil.download(parse[0].url, filePath);
            return path;
        } catch (err) {
            logger.dir(err, LogLevel.Error);
            return;
        }
    }

    async downloadRandomCat() {
        const url = 'https://aws.random.cat/meow';
        try {
            logger.debug('Downloading random cat');
            const { body } = await got.get(url, { timeout: { request: this._timeout } });
            const parse = JSON.parse(body);
            const split = parse.file.split('/');
            const filePath = './cache/images/' + split[split.length - 1];
            const path = await NetUtil.download(parse.file, filePath);
            return path;
        } catch (err) {
            logger.dir(err, LogLevel.Error);
            return;
        }
    }

}

class DogeSubReplier extends PictureSubReplier {

    type = 'picture/doge';

    protected _regexes = [ 
        /来(点|电|份|张)狗(狗|图)/,
        /來(點|電|份|張)狗(狗|圖)/
    ];
    protected _downloadingHint = '正在检索狗狗数据库，请博士耐心等待...';
    protected _downloadErrorHint = '图片被狗狗吞噬了，请博士稍后再试。';
    protected _sendErrorHint = '图片发送过程中发生致命错误，您的开水壶已被炸毁。';
    protected _downloadFuncs = [
        () => this.downloadShibe(),
    ];

    async downloadShibe() {
        const url = 'http://shibe.online/api/shibes?count=1&urls=true&httpsUrls=true';
        try {
            logger.debug('Downloading shibe');
            const { body } = await got.get(url);
            const parse = JSON.parse(body);
            const split = parse[0].split('/');
            const filePath = './cache/images/' + split[split.length - 1];
            const path = await NetUtil.download(parse[0], filePath);
            return path;
        } catch (err) {
            logger.dir(err, LogLevel.Error);
            return;
        }
    }

}

class SetuSubReplier extends Replier {

    type = 'picture/setu';
    
    protected _timeout = 8000;
    protected _regexes = [ 
        /来(点|电|份|张)(涩|瑟|色|美|帅)?图(片|图)?(.*)/,
        /來(點|電|份|張)(澀|瑟|色|美|帥)?圖(片|圖)?(.*)/
    ];
    protected _downloadingHint = '正在检索猫猫数据库，请博士耐心等待...';
    protected _downloadErrorHint = '图片被猫猫吞噬了，请博士稍后再试。';
    protected _sendErrorHint = '图片发送过程中发生致命错误，您的开水壶已被炸毁。';

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        for (const regex of this._regexes) {
            const r = regex.exec(msg.content as string);
            if (r) return { confidence: 1, data: r};
        }
        return NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult> {
        const config = this.getConfig(bot, msg.topic_id);
        const options: PxkoreOptions = {
            clientId: msg._isDirect? 'mew/' + msg.author_id : 'mew/public',
            shouldRecord: true,
            isRandomSample: false,
            appendTotalSampleInfo: true,
        };
        
        // tags
        if (test.data[4]) {
            const keywords = test.data[4].replace('　', ' ').trim().split(' ') as string[];
            if (keywords) {
                if (keywords.indexOf('-random') != -1
                    || keywords.indexOf('-r') != -1) {
                    Util.removeElem(keywords, '-random');
                    Util.removeElem(keywords, '-r');
                    options.clientId = undefined;
                }
                if (keywords.indexOf('-norecord') != -1
                    || keywords.indexOf('-nr') != -1) {
                    Util.removeElem(keywords, '-norecord');
                    Util.removeElem(keywords, '-nr');
                    options.shouldRecord = false;
                }

                options.tags = keywords;
            }
        }
        if (Util.isArrEmpty(options.tags) && config) {
            options.tags = config.tags;
            options.isRandomSample = true;
        }

        if (config) {
            options.excludedTags = config.excludedTags;
            if (config.fallbackTags && config.fallbackTags.length > 0)
                options.fallbackTags = Util.randomItem(config.fallbackTags);
        }
        
        const hint = await bot.replyText(msg, this._downloadingHint);
        const result = await Pxkore.request();
        let error;
        if (result) {
            const image = await bot.replyImage(msg, result.path);
            if (!image.data || !image.data.id) {
                error = this._sendErrorHint;
            }
        } else {
            error = this._downloadErrorHint;
        }
        await Util.sleep(100);
        if (result && result.info) {
            await bot.replyText(msg, result.info, MesageReplyMode.None, false);
            await Util.sleep(100);
        }
        if (hint.data) {
            await bot.client.deleteMessage(hint.data.id);
        }
        if (error) {
            await bot.replyText(msg, error);
        }
        return Replied;
    }

}