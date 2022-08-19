import got from 'got';
import * as fs from 'fs';
import { HttpsProxyAgent } from "hpagent";
import * as stream from 'stream';
import { promisify } from 'util';
import { logger, LogLevel } from "mewbot";
import { FileUtil, Util } from "../../../bot/index.js";
import { Character, ICharacter } from '../../models/ak/character.js';
import { MiscConfig } from '../../models/config.js';
const pipeline = promisify(stream.pipeline);

const root = 'https://cdn.jsdelivr.net/gh/Kengxxiao/ArknightsGameData/zh_CN/gamedata/';
const fileUris = [
    'excel/handbook_info_table.json',
    'excel/character_table.json',
    'excel/charword_table.json',
    'excel/gacha_table.json',
    'excel/item_table.json',
    'excel/building_data.json',
    'excel/enemy_handbook_table.json',
    'excel/handbook_team_table.json',
    'excel/roguelike_topic_table.json',
    'excel/activity_table.json',
];

export class AkDataImporter {

    static async updateAll(proxy?: string, ) {
        try {
            // 下载所有资源至本地
            await this.downloadResources(proxy);
            // 更新角色基本信息
            await this.updateCharacters();
            // // 更新手册
            // await updateHandbook();
            // // 更新CV
            // await updateCv();
            // // 更新物品
            // await updateItems();
            // // 更新基建信息
            // await updateBuildingData();
            // // 更新势力信息
            // await updateHandbookTeam();
            // // 更新敌人
            // await updateEnemyHandbook();
            // // 更新roguelike
            // await updateRoguelike();
            return true;
        } catch (err) {
            logger.error('Update data error!');
            logger.dir(err, LogLevel.Error);
            return false;
        }
    }
    
    static async downloadResources(proxy?: string) {
        for (const path of fileUris) {
            const filePath = './cache/' + path;
            if (!(await FileUtil.exists(filePath))) {
                await FileUtil.create(filePath);
            }
            const url = root + path;
            const options = proxy? {
                https: {
                    rejectUnauthorized: false,
                },
                agent: {
                    https: new HttpsProxyAgent({
                        keepAlive: true,
                        keepAliveMsecs: 1000,
                        maxSockets: 256,
                        maxFreeSockets: 256,
                        scheduling: 'lifo',
                        proxy,
                    })
                }
            } : {};
            logger.debug('Start downloading of file: ' + url);
            await pipeline(got.stream(url, options), fs.createWriteStream(filePath));
        }
        logger.debug('All files are downloaded.');
    }

    static async updateCharacters() {
        let raw = fs.readFileSync('./cache/excel/character_table.json').toString();
        const charsData = JSON.parse(raw);
        raw = fs.readFileSync('./cache/excel/gacha_table.json').toString();
        const recruitDetail: string = JSON.parse(raw).recruitDetail;

        // 获取公招干员列表
        const split = recruitDetail.split('★\\n');
        split.shift();  // 去除第一个
        const recruits = [];
        for (let i = 0; i < split.length; i++) {
            split[i] = split[i].replace(/\n-+\n★+/, '');
            split[i] = split[i].replace(RegExp('<@rc.eml>', 'g'), '');
            split[i] = split[i].replace(RegExp('</>', 'g'), '');
            const s = split[i].split('/');
            for (const item of s) {
                recruits.push(item.trim());
            }
        }

        // 干员导入数据库
        const chars: ICharacter[] = [];
        const tags: string[] = [];     // 同时获取所有干员的tag
        for (const s in charsData) {
            const char = charsData[s] as ICharacter;
            char.charID = s; // 记录下id
            if (recruits.indexOf(char.name) != -1) {
                char.canRecruit = true;  // 记录是否可被公招
            }
            chars.push(char);

            if (char.tagList) {
                Util.pushAllUnique(tags, char.tagList);
            }
        }

        // 干员导入characters
        const result = await Character.upsertMany(['charID'], chars);
        logger.log(`Characters updated, Upsert: ${result.upsertedCount} Modified: ${result.modifiedCount}`);

        // tag导入configs
        await MiscConfig.upsertOneByName('tags', tags);
        logger.log('Character tags updated.');
    }
}
