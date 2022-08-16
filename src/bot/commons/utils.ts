export class utils {

    static randomFloat(min: number, max: number) {
        return Math.random() * (max - min) + min;
    }

    static randomInt(min: number, max: number) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    static randomItem<T>(array: T[]) {
        const index = this.randomInt(0, array.length - 1);
        return array[index];
    }

    static getNumber(str: string, defaultValue: number) {
        if (!str) {
            return defaultValue;
        }
        let num = parseInt(str);
        if (isNaN(num)) {
            num = 0;
        }
        return num;
    }

    static sleep(timeout: number) {
        return new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    }

    static getTimeCounterText(time: number): string {
        if (time < 60) {
            return time + '秒';
        } else {
            time = Math.ceil(time / 60);
            return time + '分钟';
        }
    }

    static getElemSafe<T>(arr: T[], index: number) {
        if (!arr) return;
        if (index < 0 || index >= arr.length) return;
        return arr[index];
    }
    
}
