/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * TableKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework TableKit
 ****************************************************************************/

import { DictionaryPool, ListPool, ReleaseDictionary2Pool, ReleaseList2Pool } from "../poolKit/PoolKit";

// #region Table

export abstract class Table<TDataItem> implements Iterable<TDataItem> {

    public Add(item: TDataItem): void {
        this.OnAdd(item);
    }

    public Remove(item: TDataItem): void {
        this.OnRemove(item);
    }

    public Clear(): void {
        this.OnClear();
    }

    public Update(): void {
    }

    public Dispose(): void {
        this.OnDispose();
    }

    protected abstract OnAdd(item: TDataItem): void;
    protected abstract OnRemove(item: TDataItem): void;
    protected abstract OnClear(): void;
    protected abstract OnDispose(): void;
    public abstract [Symbol.iterator](): Iterator<TDataItem>;
}

// #endregion

// #region TableIndex

export class TableIndex<TKeyType, TDataItem> {

    private mIndex: Map<TKeyType, TDataItem[]> = DictionaryPool.Get<TKeyType, TDataItem[]>();
    private readonly mGetKeyByDataItem: (item: TDataItem) => TKeyType;

    public constructor(keyGetter: (item: TDataItem) => TKeyType) {
        this.mGetKeyByDataItem = keyGetter;
    }

    public get Dictionary(): Map<TKeyType, TDataItem[]> {
        return this.mIndex;
    }

    public Add(dataItem: TDataItem): void {
        const key = this.mGetKeyByDataItem(dataItem);
        const list = this.mIndex.get(key);
        if (list) {
            list.push(dataItem);
        } else {
            const newList = ListPool.Get<TDataItem>();
            newList.push(dataItem);
            this.mIndex.set(key, newList);
        }
    }

    public Remove(dataItem: TDataItem): void {
        const key = this.mGetKeyByDataItem(dataItem);
        const list = this.mIndex.get(key);
        if (list) {
            const idx = list.indexOf(dataItem);
            if (idx >= 0) {
                list.splice(idx, 1);
            }
        }
    }

    public Get(key: TKeyType): TDataItem[] {
        const list = this.mIndex.get(key);
        return list ? list : [];
    }

    public Clear(): void {
        this.mIndex.forEach((list) => {
            list.length = 0;
        });
        this.mIndex.clear();
    }

    public Dispose(): void {
        this.mIndex.forEach((list) => {
            ReleaseList2Pool(list);
        });
        ReleaseDictionary2Pool(this.mIndex);
        this.mIndex = null;
    }
}

// #endregion
