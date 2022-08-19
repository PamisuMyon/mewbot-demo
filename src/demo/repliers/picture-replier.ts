import { logger, LogLevel, Message } from "mewbot";
import got from "got";
import { MatryoshkaReplier, TestInfo, IBot, ReplyResult, Util, FileUtil, NetUtil, Replier, TestParams, FullConfidence, NoConfidence, Replied } from "../../bot/index.js";

export class PictureReplier extends MatryoshkaReplier {
    
    override type = 'picture';

    protected override _children = [
        new KittySubReplier(),
        new DogeSubReplier(),
    ];

}

abstract class PictureSubReplier extends Replier {
    
    protected _timeout = 8000;
    protected abstract _regex: RegExp;
    protected abstract _downloadFuncs: Array<() => Promise<string | undefined>>;
    protected abstract _downloadingHint: string;
    protected abstract _downloadErrorHint: string;
    protected abstract _sendErrorHint: string;

    override async test(msg: Message, options: TestParams): Promise<TestInfo> {
        if (!msg.content) return NoConfidence;
        const b = this._regex.test(msg.content as string);
        return b? FullConfidence : NoConfidence;
    }

    override async reply(bot: IBot, msg: Message, test: TestInfo): Promise<ReplyResult | undefined> {
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

    protected override _regex = /来(点|电|份|张)猫(猫|图)/;
    protected _downloadingHint = '正在努力寻找猫猫...';
    protected _downloadErrorHint = '图片被猫猫吞噬了';
    protected _sendErrorHint = '图片发送过程中发生致命错误';
    protected override _downloadFuncs = [
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

    protected _regex = /来(点|电|份|张)狗(狗|图)/;
    protected _downloadingHint = '正在努力寻找狗狗...';
    protected _downloadErrorHint = '图片被狗狗吞噬了';
    protected _sendErrorHint = '图片发送过程中发生致命错误';
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
