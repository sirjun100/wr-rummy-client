/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * PoolKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework PoolKit
 ****************************************************************************/

import { ISingleton } from "../singletonKit/SingletonKit";

// #region IPool

export interface IPoolable {
    OnRecycled(): void;
    IsRecycled: boolean;
}

export interface IPoolType extends IPoolable {
    Recycle2Cache(): void;
}

export interface IObjectFactory<T> {
    Create(): T;
}

export class DefaultObjectFactory<T> implements IObjectFactory<T> {

    private readonly mCreator: () => T;

    public constructor(creator: () => T) {
        this.mCreator = creator;
    }

    public Create(): T {
        return this.mCreator();
    }
}

export class CustomObjectFactory<T> implements IObjectFactory<T> {

    private readonly mFactoryMethod: () => T;

    public constructor(factoryMethod: () => T) {
        this.mFactoryMethod = factoryMethod;
    }

    public Create(): T {
        return this.mFactoryMethod();
    }
}

export abstract class Pool<T> {

    protected mFactory: IObjectFactory<T>;
    protected readonly mCacheStack: T[] = [];
    protected mMaxCount: number = 12;

    protected constructor(factory: () => T) {
        this.mFactory = new DefaultObjectFactory<T>(factory);
    }

    public get CurCount(): number {
        return this.mCacheStack.length;
    }

    public SetObjectFactory(factory: IObjectFactory<T>): void {
        this.mFactory = factory;
    }

    public SetFactoryMethod(factoryMethod: () => T): void {
        this.mFactory = new CustomObjectFactory<T>(factoryMethod);
    }

    public Clear(onClearItem?: (item: T) => void): void {
        if (onClearItem) {
            for (let i = 0; i < this.mCacheStack.length; i++) {
                onClearItem(this.mCacheStack[i]);
            }
        }
        this.mCacheStack.length = 0;
    }

    public Allocate(): T {
        if (this.mCacheStack.length === 0) {
            return this.mFactory.Create();
        }
        return this.mCacheStack.pop();
    }

    public abstract Recycle(obj: T): boolean;
}

// #endregion

// #region SafeObjectPool

export class SafeObjectPool<T extends IPoolable> extends Pool<T> implements ISingleton {

    private static readonly sPoolMap: Map<Function, SafeObjectPool<any>> = new Map();

    public static Instance<T extends IPoolable>(type: Constructor<T>): SafeObjectPool<T> {
        if (!SafeObjectPool.sPoolMap.has(type)) {
            const pool = new SafeObjectPool<T>(type);
            pool.OnSingletonInit();
            SafeObjectPool.sPoolMap.set(type, pool);
        }
        return SafeObjectPool.sPoolMap.get(type) as SafeObjectPool<T>;
    }

    public static Dispose<T extends IPoolable>(type: Constructor<T>): void {
        SafeObjectPool.sPoolMap.delete(type);
    }

    private constructor(type: Constructor<T>) {
        super(() => new type());
    }

    public OnSingletonInit(): void { }

    public Dispose(): void {
        this.Clear();
    }

    public Init(maxCount: number, initCount: number): void {
        this.mMaxCount = maxCount;
        let count = initCount;
        if (maxCount > 0) {
            count = Math.min(maxCount, initCount);
        }
        while (this.CurCount < count) {
            this.Recycle(this.mFactory.Create());
        }
    }

    public get MaxCacheCount(): number {
        return this.mMaxCount;
    }

    public set MaxCacheCount(value: number) {
        this.mMaxCount = value;
        if (this.mMaxCount > 0 && this.mCacheStack.length > this.mMaxCount) {
            this.mCacheStack.length = this.mMaxCount;
        }
    }

    public Allocate(): T {
        const result = super.Allocate();
        result.IsRecycled = false;
        return result;
    }

    public Recycle(t: T): boolean {
        if (!t || t.IsRecycled) {
            return false;
        }
        if (this.mMaxCount > 0 && this.mCacheStack.length >= this.mMaxCount) {
            t.OnRecycled();
            return false;
        }
        t.IsRecycled = true;
        t.OnRecycled();
        this.mCacheStack.push(t);
        return true;
    }
}

type Constructor<T> = new (...args: any[]) => T;

// #endregion

// #region ListPool

const listPoolStack: any[][] = [];

export class ListPool {

    public static Get<T>(): T[] {
        if (listPoolStack.length === 0) {
            return [];
        }
        return listPoolStack.pop() as T[];
    }

    public static Release<T>(toRelease: T[]): void {
        if (listPoolStack.indexOf(toRelease) >= 0) {
            throw new Error("重复回收 List，The List is released even though it is in the pool");
        }
        toRelease.length = 0;
        listPoolStack.push(toRelease);
    }
}

export function ReleaseList2Pool<T>(self: T[]): void {
    ListPool.Release(self);
}

// #endregion

// #region DictionaryPool

const dictionaryPoolStack: Map<any, any>[] = [];

export class DictionaryPool {

    public static Get<TKey, TValue>(): Map<TKey, TValue> {
        if (dictionaryPoolStack.length === 0) {
            return new Map<TKey, TValue>();
        }
        return dictionaryPoolStack.pop() as Map<TKey, TValue>;
    }

    public static Release<TKey, TValue>(toRelease: Map<TKey, TValue>): void {
        toRelease.clear();
        dictionaryPoolStack.push(toRelease);
    }
}

export function ReleaseDictionary2Pool<TKey, TValue>(self: Map<TKey, TValue>): void {
    DictionaryPool.Release(self);
}

// #endregion

// #region SimpleObjectPool

export class SimpleObjectPool<T> extends Pool<T> {

    private readonly mResetMethod: (obj: T) => void;

    public constructor(factoryMethod: () => T, resetMethod: (obj: T) => void = null, initCount: number = 0) {
        super(factoryMethod);
        this.mResetMethod = resetMethod;
        for (let i = 0; i < initCount; i++) {
            this.mCacheStack.push(this.mFactory.Create());
        }
    }

    public Recycle(obj: T): boolean {
        if (this.mResetMethod) {
            this.mResetMethod(obj);
        }
        this.mCacheStack.push(obj);
        return true;
    }
}

// #endregion
