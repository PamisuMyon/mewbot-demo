import got from "got";
import * as fs from 'fs';
import * as stream from 'stream';
import { promisify } from 'util';
import { logger, LogLevel } from "mewbot";

export class NetUtil {

    static pipeline = promisify(stream.pipeline);

    static async download(url: string, filePath: string) {
        try {
            if (!fs.existsSync(filePath)) {
                this.createFile(filePath);
            }
            logger.debug('Start downloading of file: ' + url);
            await this.pipeline(got.stream(url), fs.createWriteStream(filePath));
            logger.debug('File downloaded: ' + filePath);
            return filePath;
        } catch (err) {
            logger.dir(err, LogLevel.Error);
        }
        return;
    }

    static createFile(path: string) {
        const arr = path.split('/');
        let dir = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            dir = dir + '/' + arr[i];
        }
        return new Promise((resolve: fs.NoParamCallback) => {
            fs.writeFile(path, '', resolve);
        });
    }

}