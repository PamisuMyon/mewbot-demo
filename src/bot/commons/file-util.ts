import * as fs from 'fs';
import { promisify } from 'util';
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);

export class FileUtil {

    static create(path: string) {
        const arr = path.split('/');
        let dir = arr[0];
        for (let i = 1; i < arr.length; i++) {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            dir = dir + '/' + arr[i];
        }
        return writeFile(path, '');
    }

    static read(path: string) {
        if (!fs.existsSync(path))
            return;
        return readFile(path);
    }

    static async write(path: string, data: string) {
        if (!fs.existsSync(path))
            await this.create(path);
        await writeFile(path, data);
    }
}
