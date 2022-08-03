import { logger } from "mewbot";
import * as fs from "fs";

const accountPath = './account.json';

/*
登录授权有两种方式，token或账密登录，推荐使用token
请在resources/config/目录下创建account.json，内容格式：
{
    "token": "你的token",
    "username": "你的MEWID",
    "password": "你的密码"
}
token 与 账号密码 二选一设置，优先使用token
目前（2022.7）官方暂未提供token获取方法，请自行使用抓包工具抓取
账密登录使用的是v1的登录API，官方已不再使用该API，有随时被弃用的风险
*/

export interface Account {
    token?: string;
    username?: string;
    password?: string;
}

export function getAccount() {
    if (!fs.existsSync(accountPath)) {
        logger.error('account.json not found. Please create it in project root directory');
    }
    const raw = fs.readFileSync(accountPath).toString();
    try {
        const account = JSON.parse(raw) as Account;
        if (account.token || (account.username && account.password)) {
            return account;
        } else {
            logger.error('Cannot find a valid account in account.json');
        }
    } catch(err) {
        logger.error('account.json: incorrect format.');
    }
    return;
}
