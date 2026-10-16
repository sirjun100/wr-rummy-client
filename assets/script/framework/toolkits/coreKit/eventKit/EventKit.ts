/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * EventKit for Cocos Creator (TypeScript)
 ****************************************************************************/


import * as cc from 'cc';
import { EasyEvent, EasyEvent1, EasyEvent2, IUnRegister } from "../../../QFramework";

// #region StringEventSystem

export class StringEventSystem {

    public static readonly Global: StringEventSystem = new StringEventSystem();

    private readonly mEvents: Map<string, EasyEvent | EasyEvent1<any>> = new Map();

    public Register(key: string, onEvent: () => void, target: object = null): IUnRegister {
        let evt = this.mEvents.get(key) as EasyEvent;
        if (!evt) {
            evt = new EasyEvent();
            this.mEvents.set(key, evt);
        }
        return evt.Register(onEvent, target);
    }

    public UnRegister(key: string, onEvent: () => void, target: object = null): void {
        const evt = this.mEvents.get(key) as EasyEvent;
        if (evt) {
            evt.UnRegister(onEvent, target);
        }
    }

    public Send(key: string): void {
        const evt = this.mEvents.get(key) as EasyEvent;
        if (evt) {
            evt.Trigger();
        }
    }

    public RegisterWithData<T>(key: string, onEvent: (data: T) => void, target: object = null): IUnRegister {
        let evt = this.mEvents.get(key) as EasyEvent1<T>;
        if (!evt) {
            evt = new EasyEvent1<T>();
            this.mEvents.set(key, evt);
        }
        return evt.RegisterWithArg(onEvent, target);
    }

    public UnRegisterWithData<T>(key: string, onEvent: (data: T) => void, target: object = null): void {
        const evt = this.mEvents.get(key) as EasyEvent1<T>;
        if (evt) {
            evt.UnRegisterWithArg(onEvent, target);
        }
    }

    public SendWithData<T>(key: string, data: T): void {
        const evt = this.mEvents.get(key) as EasyEvent1<T>;
        if (evt) {
            evt.Trigger(data);
        }
    }
}

// Unity: Register<T>(key, Action<T>) / Send<T>(key, data)
// TS 用 RegisterWithData / SendWithData，避免泛型运行时擦除

// #endregion

// #region EnumEventSystem

export class EnumEventSystem {

    public static readonly Global: EnumEventSystem = new EnumEventSystem();

    private readonly mEvents: Map<number, EasyEvent2<number, any[]>> = new Map();

    private static ToInt(key: number | string): number {
        return typeof key === "number" ? key : Number(key);
    }

    public Register(key: number | string, onEvent: (eventId: number, args: any[]) => void, target: object = null): IUnRegister {
        const kv = EnumEventSystem.ToInt(key);
        let evt = this.mEvents.get(kv);
        if (!evt) {
            evt = new EasyEvent2<number, any[]>();
            this.mEvents.set(kv, evt);
        }
        return evt.RegisterWithArg(onEvent, target);
    }

    public UnRegister(key: number | string, onEvent: (eventId: number, args: any[]) => void, target: object = null): void {
        const kv = EnumEventSystem.ToInt(key);
        const evt = this.mEvents.get(kv);
        if (evt) {
            evt.UnRegisterWithArg(onEvent, target);
        }
    }

    public UnRegisterKey(key: number | string): void {
        this.mEvents.delete(EnumEventSystem.ToInt(key));
    }

    public UnRegisterAll(): void {
        this.mEvents.clear();
    }

    public Send(key: number | string, ...args: any[]): void {
        const kv = EnumEventSystem.ToInt(key);
        const evt = this.mEvents.get(kv);
        if (evt) {
            evt.Trigger(kv, args);
        }
    }
}

// #endregion

// #region OnPointerClickEventTrigger (Cocos)

const { ccclass } = cc._decorator;

@ccclass
export class OnPointerClickEventTrigger extends cc.Component {

    public readonly OnPointerClickEvent: EasyEvent1<cc.EventTouch> = new EasyEvent1<cc.EventTouch>();

    protected onEnable(): void {
        this.node.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    protected onDisable(): void {
        this.node.off(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    private onTouchEnd(event: cc.EventTouch): void {
        this.OnPointerClickEvent.Trigger(event);
    }
}

export class OnPointerClickEventTriggerExtension {

    public static OnPointerClickEvent(node: cc.Node, onPointerClick: (e: cc.EventTouch) => void, target: object = null): IUnRegister {
        let trigger = node.getComponent(OnPointerClickEventTrigger);
        if (!trigger) {
            trigger = node.addComponent(OnPointerClickEventTrigger);
        }
        return trigger.OnPointerClickEvent.RegisterWithArg(onPointerClick, target);
    }
}

// #endregion
