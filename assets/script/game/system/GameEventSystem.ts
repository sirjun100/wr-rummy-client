// @ts-nocheck
import { AbstractSystem, IUnRegister } from "../../framework/QFramework";
import { StringEventSystem } from "../../framework/toolkits/coreKit/eventKit/EventKit";

export type GameEventChannel = string | number;

type ListenerRecord = {
    key: string;
    target: object;
    unregister: IUnRegister;
};

/** 应用是否在后台（替代旧 ToolUtils.enterBackGround）。 */
export let AppInBackground = false;

/**
 * 字符串/数字频道总线（PushEvent、跳转 id 等）。
 */
export class GameEventSystem extends AbstractSystem {
    private readonly _bus = new StringEventSystem();
    private readonly _records: ListenerRecord[] = [];

    protected OnInit(): void {}

    private channelKey(channel: GameEventChannel): string {
        return `${channel}`;
    }

    emit(channel: GameEventChannel, payload: unknown = null): void {
        if (AppInBackground) {
            return;
        }
        this._bus.SendWithData(this.channelKey(channel), payload);
    }

    on<T = unknown>(
        channel: GameEventChannel,
        handler: (payload: T) => void,
        target: object = null
    ): IUnRegister {
        const key = this.channelKey(channel);
        const unregister = this._bus.RegisterWithData<T>(key, handler, target);
        if (target != null) {
            this._records.push({ key, target, unregister });
        }
        return unregister;
    }

    offByTarget(target: object): void {
        if (target == null) {
            return;
        }
        for (let i = this._records.length - 1; i >= 0; i--) {
            const rec = this._records[i];
            if (rec.target === target) {
                rec.unregister?.UnRegister();
                this._records.splice(i, 1);
            }
        }
    }
}
