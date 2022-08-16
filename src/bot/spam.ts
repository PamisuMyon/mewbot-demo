interface SpamInfo {
    id: string;     // 可以为任意id，为用户id时，按用户行为计算冷却，为话题id时，按话题行为计算冷却等等
    cmdCount: number;  // 累计使用指令次数
    cmdTime: number;   // 上一次使用指令时间
    cooldownTime: number;   // 目标冷却时间
    failedTimes: number;     // 不通过次数
}

export interface CheckResult { 
    pass: boolean;      // 是否通过
    remain?: number;        // 剩余冷却时间
    failedTimes?: number;     // 不通过次数
}

/**
 * 防刷屏检测
 * 使用示例参照 {@link PrimaryReplier}
 */
export class Spam {

    protected _interval: number;
    protected _threshold: number;
    protected _cooldown: number;
    protected _infos: { [id: string]: SpamInfo };

    /**
     * @param interval 连击生效间隔 单位毫秒
     * @param threshold 冷却连击阈值 
     * @param cooldown 冷却时间 单位毫秒
     */
    constructor(interval?: number, threshold?: number, cooldown?: number) {
        this._infos = {};
        this._interval = interval || 45000;
        this._threshold = threshold || 3;
        this._cooldown = cooldown || 60000;
    }

    /**
     * Spam检测
     * @param id 任意id，例如用户id，话题/节点id等
     */
    check(id: string): CheckResult  {
        if (!this._infos[id]) {
            return { pass: true };
        }

        const info = this._infos[id];
        const time = new Date().getTime();
        // 冷却中
        if (info.cooldownTime >= time) {
            info.failedTimes++;
            return { 
                pass: false, 
                remain: info.cooldownTime - time, 
                failedTimes: info.failedTimes 
            };
        }
        return { pass: true };
    }

    /**
     * Spam记录
     * @param id 任意id，例如用户id，话题/节点id等
     */
    record(id: string) {
        const time = new Date().getTime();
        if (!this._infos[id]) {
            this._infos[id] = {
                id,
                cmdCount: 1,
                cmdTime: time,
                cooldownTime: -1,
                failedTimes: 0,
            };
        } else {
            const info = this._infos[id];
            // 如果距离上一次指令时间没有超过连击间隔，则累计指令数
            if (info.cmdTime >= time - this._interval) {
                info.cmdCount++;
                // 如果连击数达到阈值，进入冷却
                if (info.cmdCount >= this._threshold) {
                    info.cooldownTime = time + this._cooldown;
                    info.cmdCount = 0;
                    info.failedTimes = 0;
                }
            } else {
                // 否则重新计数
                info.cmdCount = 1;
            }
            info.cmdTime = time;
        }
    }
}
