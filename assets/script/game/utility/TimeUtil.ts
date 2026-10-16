import { sys } from "cc";

/** 时间与日期展示。 */
export class TimeUtil {
    private static localTimeDiffMs = 0;

    public static SetLocalTimeDiffMs(diff: number): void {
        TimeUtil.localTimeDiffMs = diff;
    }

    public static GetOsTime(): number {
        return sys.now() + TimeUtil.localTimeDiffMs;
    }

    public static FormatDurationSeconds(totalSeconds: number, mode: number = 0): string {
        const hour = 3600;
        if (mode === 0) {
            if (totalSeconds >= hour) {
                const minutes = parseInt(String((totalSeconds % hour) / 60), 10);
                const seconds = parseInt(String((totalSeconds % hour) % 60), 10);
                return `${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`;
            }
            if (totalSeconds >= 60) {
                const minutes = parseInt(String(totalSeconds / 60), 10);
                const seconds = parseInt(String(totalSeconds % 60), 10);
                return `${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`;
            }
            return `00:${`0${totalSeconds}`.slice(-2)}`;
        }
        if (totalSeconds >= hour) {
            const hours = parseInt(String(totalSeconds / hour), 10);
            const minutes = parseInt(String((totalSeconds % hour) / 60), 10);
            const seconds = parseInt(String((totalSeconds % hour) % 60), 10);
            return `${`0${hours}`.slice(-2)}:${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`;
        }
        if (totalSeconds >= 60) {
            const minutes = parseInt(String(totalSeconds / 60), 10);
            const seconds = parseInt(String(totalSeconds % 60), 10);
            return `00:${`0${minutes}`.slice(-2)}:${`0${seconds}`.slice(-2)}`;
        }
        return `00:00:${`0${totalSeconds}`.slice(-2)}`;
    }

    public static GetPhoneTimeShow(): string {
        const now = new Date();
        let text = `${now.getFullYear()}`;
        const month = now.getMonth() + 1;
        text = month < 10 ? `${text}-0${month}` : `${text}-${month}`;
        text = now.getDate() < 10 ? `${text}-0${now.getDate()}` : `${text}-${now.getDate()}`;
        text = now.getHours() < 10 ? `${text} 0${now.getHours()}` : `${text} ${now.getHours()}`;
        text = now.getMinutes() < 10 ? `${text}:0${now.getMinutes()}` : `${text}:${now.getMinutes()}`;
        text = now.getSeconds() < 10 ? `${text}:0${now.getSeconds()}` : `${text}:${now.getSeconds()}`;
        return text;
    }

    public static IsToday(timestampMs: number): boolean {
        const today = new Date(sys.now());
        const target = new Date(timestampMs);
        return (
            today.getFullYear() === target.getFullYear() &&
            today.getMonth() === target.getMonth() &&
            today.getDate() === target.getDate()
        );
    }

    public static GetMonthDayCount(year: number, month: number): number {
        if (month === 2) {
            return year % 4 === 0 ? 29 : 28;
        }
        if ([1, 3, 5, 7, 8, 10, 12].includes(month)) {
            return 31;
        }
        return 30;
    }

    /** @deprecated */
    public static timeStr2 = TimeUtil.FormatDurationSeconds;
    public static getPhontTimeShow = TimeUtil.GetPhoneTimeShow;
    public static getOsTime = TimeUtil.GetOsTime;
}
