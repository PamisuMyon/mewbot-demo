import { logger, LogLevel, Message } from "mewbot";
import got from "got";
import { NetUtil } from "../commons/net-util.js";
import { utils } from "../commons/utils.js";
import { IBot } from "../ibot.js";
import { SubReplier, PrimaryReplier, ReplyAction, ReplyResult, SubReplyTestResult } from "./replier.js";
import { FileUtil } from "../commons/file-util.js";

export class PictureReplier extends PrimaryReplier {
    
    override type = 'picture';

    protected override _subRepliers = [
        new KittySubReplier(),
        new DogeSubReplier(),
    ];

}

abstract class PictureSubReplier implements SubReplier {
    
    protected _timeout = 8000;
    protected abstract _regex: RegExp;
    protected abstract _downloadFuncs: Array<() => Promise<string | undefined>>;
    protected abstract _downloadingHint: string;
    protected abstract _downloadErrorHint: string;
    protected abstract _sendErrorHint: string;

    async test(msg: Message): Promise<SubReplyTestResult> {
        const b = this._regex.test(msg.content as string);
        return { confidence: b? 1 : 0 };
    }

    async reply(bot: IBot, msg: Message, data?: any): Promise<ReplyResult> {
        const hint = await bot.replyText(msg, this._downloadingHint);
        const file = await utils.randomItem(this._downloadFuncs)();
        let error;
        if (file) {
            const image = await bot.client.sendImageMessage(msg.topic_id, file);
            if (!image.data || !image.data.id) {
                error = this._sendErrorHint;
            } else {
                // 删除缓存文件
                await FileUtil.delete(file);
            }
        } else {
            error = this._downloadErrorHint;
        }
        await utils.sleep(100);
        if (hint.data) {
            await bot.client.deleteMessage(hint.data.id);
        }
        if (error) {
            await bot.replyText(msg, error);
        }
        return { action: ReplyAction.Replied };
    }

}

class KittySubReplier extends PictureSubReplier {

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
            let { body } = await got.get(url, { timeout: { request: this._timeout } });
            let parse = JSON.parse(body);
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
