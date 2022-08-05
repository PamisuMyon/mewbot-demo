import got from "got";
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import { logger, LogLevel } from "mewbot";
import { FileUtil } from "./file-util.js";

export class NetUtil {

    static pipeline = promisify(stream.pipeline);

    static async download(url: string, filePath: string) {
        try {
            FileUtil.create(filePath);
            logger.debug('Start downloading of file: ' + url);
            await this.pipeline(got.stream(url), fs.createWriteStream(filePath));
            logger.debug('File downloaded: ' + filePath);
            return filePath;
        } catch (err) {
            logger.dir(err, LogLevel.Error);
        }
        return;
    }

}