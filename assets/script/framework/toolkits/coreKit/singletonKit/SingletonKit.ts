/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * SingletonKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework SingletonKit
 ****************************************************************************/


import * as cc from 'cc';
// #region ISingleton

export interface ISingleton {
    OnSingletonInit(): void;
}

// #endregion

// #region SingletonCreator

class SingletonCreator {

    public static IsUnitTestMode: boolean = false;

    public static CreateSingleton<T extends ISingleton>(type: { new(): T }): T {
        const instance = new type();
        instance.OnSingletonInit();
        return instance;
    }

    public static CreateMonoSingleton<T extends cc.Component & ISingleton>(type: Constructor<T>): T {
        if (SingletonCreator.IsUnitTestMode) {
            // unit test mode handled below
        }

        const scene = cc.director.getScene();
        if (scene) {
            const existing = scene.getComponentsInChildren(type);
            if (existing && existing.length > 0) {
                existing[0].OnSingletonInit();
                return existing[0];
            }
        }

        const node = new cc.Node(type.name);
        if (!SingletonCreator.IsUnitTestMode) {
            cc.game.addPersistRootNode(node);
        }
        const instance = node.addComponent(type);
        instance.OnSingletonInit();
        return instance;
    }
}

type Constructor<T> = new (...args: any[]) => T;

// #endregion

// #region SingletonProperty

export class SingletonProperty {

    private static readonly sInstances: Map<Function, ISingleton> = new Map();

    public static GetInstance<T extends ISingleton>(type: Constructor<T>): T {
        if (!SingletonProperty.sInstances.has(type)) {
            SingletonProperty.sInstances.set(type, SingletonCreator.CreateSingleton(type));
        }
        return SingletonProperty.sInstances.get(type) as T;
    }

    public static Dispose<T extends ISingleton>(type: Constructor<T>): void {
        SingletonProperty.sInstances.delete(type);
    }
}

// #endregion

// #region Singleton

export abstract class Singleton implements ISingleton {

    private static readonly sInstances: Map<Function, Singleton> = new Map();

    public static GetInstance<T extends Singleton>(this: Constructor<T>): T {
        if (!Singleton.sInstances.has(this)) {
            const instance = SingletonCreator.CreateSingleton(this);
            Singleton.sInstances.set(this, instance);
        }
        return Singleton.sInstances.get(this) as T;
    }

    public static DisposeInstance<T extends Singleton>(this: Constructor<T>): void {
        Singleton.sInstances.delete(this);
    }

    public OnSingletonInit(): void { }

    public Dispose(): void {
        const ctor = (this as object).constructor as Constructor<Singleton>;
        Singleton.sInstances.delete(ctor);
    }
}

// #endregion

// #region MonoSingleton

export abstract class MonoSingleton extends cc.Component implements ISingleton {

    private static readonly sInstances: Map<Function, MonoSingleton> = new Map();

    public static GetInstance<T extends MonoSingleton>(type: Constructor<T>): T {
        if (MonoSingleton.sInstances.has(type)) {
            const cached = MonoSingleton.sInstances.get(type);
            if (cached && cc.isValid(cached.node)) {
                return cached as T;
            }
            MonoSingleton.sInstances.delete(type);
        }
        const instance = SingletonCreator.CreateMonoSingleton(type);
        MonoSingleton.sInstances.set(type, instance);
        return instance;
    }

    public static DisposeInstance<T extends MonoSingleton>(type: Constructor<T>): void {
        const instance = MonoSingleton.sInstances.get(type);
        if (instance && cc.isValid(instance.node)) {
            instance.node.destroy();
        }
        MonoSingleton.sInstances.delete(type);
    }

    public OnSingletonInit(): void { }

    public Dispose(): void {
        if (cc.isValid(this.node)) {
            this.node.destroy();
        }
        const ctor = (this as object).constructor as Constructor<MonoSingleton>;
        MonoSingleton.sInstances.delete(ctor);
    }

    protected onDestroy(): void {
        const ctor = (this as object).constructor as Constructor<MonoSingleton>;
        MonoSingleton.sInstances.delete(ctor);
    }
}

// #endregion
