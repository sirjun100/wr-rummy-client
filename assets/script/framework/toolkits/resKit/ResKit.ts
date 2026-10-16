/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * ResKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework ResKit (core runtime)
 ****************************************************************************/


import * as cc from 'cc';
import { LogKit } from "../coreKit/logKit/LogKit";
import { IPoolable, IPoolType, SafeObjectPool } from "../coreKit/poolKit/PoolKit";
import { MonoSingleton } from "../coreKit/singletonKit/SingletonKit";
import { Table, TableIndex } from "../coreKit/tableKit/TableKit";

// #region Types

export enum ResState {
    Waiting = 0,
    Loading = 1,
    Ready = 2,
}

export const ResLoadType = {
    AssetBundle: 0,
    ABAsset: 1,
    ABScene: 2,
    Internal: 3,
    NetImageRes: 4,
    LocalImageRes: 5,
};

/** C# `typeof(AssetBundle)` 占位 token */
export class AssetBundleAssetType {
}

export type AssetType = Function;

// #endregion

// #region RefCounter

export interface IRefCounter {
    RefCount: number;
    Retain(refOwner?: object): void;
    Release(refOwner?: object): void;
}

export class SimpleRC implements IRefCounter {

    public RefCount: number = 0;

    public Retain(refOwner?: object): void {
        this.RefCount++;
    }

    public Release(refOwner?: object): void {
        this.RefCount--;
        if (this.RefCount === 0) {
            this.OnZeroRef();
        }
    }

    protected OnZeroRef(): void { }
}

// #endregion

// #region IRes

export interface IEnumeratorTask {
    DoLoadAsync(finishCallback: () => void): void;
}

export interface IRes extends IRefCounter, IEnumeratorTask, IPoolable, IPoolType {
    AssetName: string;
    OwnerBundleName: string;
    State: ResState;
    Asset: any;
    Progress: number;
    AssetType: AssetType;

    RegisteOnResLoadDoneEvent(listener: (result: boolean, res: IRes) => void): void;
    UnRegisteOnResLoadDoneEvent(listener: (result: boolean, res: IRes) => void): void;
    UnloadImage(flag: boolean): boolean;
    LoadSync(): boolean;
    LoadAsync(): void;
    GetDependResList(): string[];
    IsDependResLoadFinish(): boolean;
    ReleaseRes(): boolean;
    Recycle2Cache(): void;
}

// #endregion

// #region Res

export class Res extends SimpleRC implements IRes {

    protected mAssetName: string = "";
    protected mResState: ResState = ResState.Waiting;
    protected mAsset: any = null;
    private mOnResLoadDoneEvent: ((result: boolean, res: IRes) => void)[] = [];

    public IsRecycled: boolean = false;

    public OwnerBundleName: string = null;
    public AssetType: AssetType = null;

    public get AssetName(): string {
        return this.mAssetName;
    }

    public set AssetName(value: string) {
        this.mAssetName = value;
    }

    public get State(): ResState {
        return this.mResState;
    }

    public set State(value: ResState) {
        this.mResState = value;
        if (this.mResState === ResState.Ready) {
            this.NotifyResLoadDoneEvent(true);
        }
    }

    public get Progress(): number {
        if (this.mResState === ResState.Ready) {
            return 1;
        }
        if (this.mResState === ResState.Loading) {
            return this.CalculateProgress();
        }
        return 0;
    }

    protected CalculateProgress(): number {
        return 0;
    }

    public get Asset(): any {
        return this.mAsset;
    }

    public RegisteOnResLoadDoneEvent(listener: (result: boolean, res: IRes) => void): void {
        if (!listener) {
            return;
        }
        if (this.mResState === ResState.Ready) {
            listener(true, this);
            return;
        }
        this.mOnResLoadDoneEvent.push(listener);
    }

    public UnRegisteOnResLoadDoneEvent(listener: (result: boolean, res: IRes) => void): void {
        if (!listener) {
            return;
        }
        const idx = this.mOnResLoadDoneEvent.indexOf(listener);
        if (idx >= 0) {
            this.mOnResLoadDoneEvent.splice(idx, 1);
        }
    }

    protected OnResLoadFaild(): void {
        this.mResState = ResState.Waiting;
        this.NotifyResLoadDoneEvent(false);
    }

    private NotifyResLoadDoneEvent(result: boolean): void {
        if (this.mOnResLoadDoneEvent.length > 0) {
            const listeners = this.mOnResLoadDoneEvent.slice();
            this.mOnResLoadDoneEvent.length = 0;
            for (let i = 0; i < listeners.length; i++) {
                listeners[i](result, this);
            }
        }
    }

    protected CheckLoadAble(): boolean {
        return this.mResState === ResState.Waiting;
    }

    protected HoldDependRes(): void {
        const depends = this.GetDependResList();
        if (!depends || depends.length === 0) {
            return;
        }
        for (let i = depends.length - 1; i >= 0; i--) {
            const keys = ResSearchKeys.Allocate(depends[i], null, AssetBundleAssetType);
            const res = ResMgr.GetInstance(ResMgr).GetRes(keys, false);
            keys.Recycle2Cache();
            if (res) {
                res.Retain();
            }
        }
    }

    protected UnHoldDependRes(): void {
        const depends = this.GetDependResList();
        if (!depends || depends.length === 0) {
            return;
        }
        for (let i = depends.length - 1; i >= 0; i--) {
            const keys = ResSearchKeys.Allocate(depends[i]);
            const res = ResMgr.GetInstance(ResMgr).GetRes(keys, false);
            keys.Recycle2Cache();
            if (res) {
                res.Release();
            }
        }
    }

    public LoadSync(): boolean {
        return false;
    }

    public LoadAsync(): void { }

    public GetDependResList(): string[] {
        return null;
    }

    public IsDependResLoadFinish(): boolean {
        const depends = this.GetDependResList();
        if (!depends || depends.length === 0) {
            return true;
        }
        for (let i = depends.length - 1; i >= 0; i--) {
            const keys = ResSearchKeys.Allocate(depends[i]);
            const res = ResMgr.GetInstance(ResMgr).GetRes(keys, false);
            keys.Recycle2Cache();
            if (!res || res.State !== ResState.Ready) {
                return false;
            }
        }
        return true;
    }

    public UnloadImage(flag: boolean): boolean {
        return false;
    }

    public ReleaseRes(): boolean {
        if (this.mResState === ResState.Loading) {
            return false;
        }
        if (this.mResState !== ResState.Ready) {
            return true;
        }
        this.OnReleaseRes();
        this.mResState = ResState.Waiting;
        this.mOnResLoadDoneEvent.length = 0;
        return true;
    }

    protected OnReleaseRes(): void {
        if (this.mAsset) {
            ResUnloadHelper.UnloadRes(this.mAsset);
            this.mAsset = null;
        }
    }

    protected override OnZeroRef(): void {
        if (this.mResState === ResState.Loading) {
            return;
        }
        this.ReleaseRes();
    }

    public DoLoadAsync(finishCallback: () => void): void {
        if (finishCallback) {
            finishCallback();
        }
    }

    public OnRecycled(): void {
        this.mAssetName = null;
        this.mOnResLoadDoneEvent.length = 0;
    }

    public Recycle2Cache(): void { }

    public toString(): string {
        return `Name:${this.AssetName}\t State:${this.State}\t RefCount:${this.RefCount}`;
    }
}

// #endregion

// #region ResUnloadHelper

class ResUnloadHelper {

    public static UnloadRes(asset: any): void {
        if (!asset) {
            return;
        }
        if (asset instanceof cc.Asset) {
            cc.assetManager.releaseAsset(asset);
        }
    }

    public static DestroyObject(obj: cc.Node): void {
        if (obj && cc.isValid(obj)) {
            obj.destroy();
        }
    }
}

// #endregion

// #region ResSearchKeys

export class ResSearchKeys implements IPoolable, IPoolType {

    public AssetName: string = null;
    public OwnerBundle: string = null;
    public AssetType: AssetType = null;
    public OriginalAssetName: string = null;
    public IsRecycled: boolean = false;

    public static Allocate(assetName: string, ownerBundleName: string = null, assetType: AssetType = null): ResSearchKeys {
        const resSearchRule = SafeObjectPool.Instance(ResSearchKeys).Allocate();
        resSearchRule.AssetName = assetName ? assetName.toLowerCase() : null;
        resSearchRule.OwnerBundle = ownerBundleName ? ownerBundleName.toLowerCase() : null;
        resSearchRule.AssetType = assetType;
        resSearchRule.OriginalAssetName = assetName;
        return resSearchRule;
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(ResSearchKeys).Recycle(this);
    }

    public Match(res: IRes): boolean {
        if (res.AssetName === this.AssetName) {
            let isMatch = true;
            if (this.AssetType) {
                isMatch = res.AssetType === this.AssetType;
            }
            if (this.OwnerBundle) {
                isMatch = isMatch && res.OwnerBundleName === this.OwnerBundle;
            }
            return isMatch;
        }
        return false;
    }

    public OnRecycled(): void {
        this.AssetName = null;
        this.OwnerBundle = null;
        this.AssetType = null;
        this.OriginalAssetName = null;
    }
}

// #endregion

// #region ResTable

class ResTable extends Table<IRes> {

    public NameIndex: TableIndex<string, IRes> = new TableIndex<string, IRes>((res) => res.AssetName);

    public get Count(): number {
        let count = 0;
        this.NameIndex.Dictionary.forEach((list) => {
            count += list.length;
        });
        return count;
    }

    public ToArray(): IRes[] {
        const result: IRes[] = [];
        this.NameIndex.Dictionary.forEach((list) => {
            for (let i = 0; i < list.length; i++) {
                result.push(list[i]);
            }
        });
        return result;
    }

    public [Symbol.iterator](): Iterator<IRes> {
        const all = this.ToArray();
        let index = 0;
        return {
            next: (): IteratorResult<IRes> => {
                if (index < all.length) {
                    return { value: all[index++], done: false };
                }
                return { value: null, done: true };
            }
        };
    }

    public GetResBySearchKeys(resSearchKeys: ResSearchKeys): IRes {
        let reses = this.NameIndex.Get(resSearchKeys.AssetName);
        if (resSearchKeys.AssetType) {
            reses = reses.filter((res) => res.AssetType === resSearchKeys.AssetType);
        }
        if (resSearchKeys.OwnerBundle) {
            reses = reses.filter((res) => res.OwnerBundleName === resSearchKeys.OwnerBundle);
        }
        return reses.length > 0 ? reses[0] : null;
    }

    protected OnAdd(item: IRes): void {
        this.NameIndex.Add(item);
    }

    protected OnRemove(item: IRes): void {
        this.NameIndex.Remove(item);
    }

    protected OnClear(): void {
        this.NameIndex.Clear();
    }

    protected OnDispose(): void { }
}

// #endregion

// #region ResourcesRes

export enum InternalResNamePrefixType {
    Url,
    Folder,
}

export class ResourcesRes extends Res {

    private mPath: string = "";

    /**
     * @param name lowercased cache key (from ResSearchKeys.AssetName)
     * @param originalName case-preserving path for cc.resources.load (Cocos paths are case-sensitive)
     */
    public static Allocate(
        name: string,
        prefixType: InternalResNamePrefixType,
        originalName?: string,
    ): ResourcesRes {
        const res = SafeObjectPool.Instance(ResourcesRes).Allocate();
        res.AssetName = name;
        const pathSource = originalName || name;
        if (prefixType === InternalResNamePrefixType.Url) {
            res.mPath = pathSource.substring("resources://".length);
        } else {
            res.mPath = pathSource.substring("resources/".length);
        }
        return res;
    }

    public LoadSync(): boolean {
        if (!this.CheckLoadAble() || !this.mAssetName) {
            return false;
        }
        this.State = ResState.Loading;
        const type = this.AssetType || cc.Asset;
        this.mAsset = cc.resources.get(this.mPath, type as any);
        if (!this.mAsset) {
            LogKit.E(`Failed to Load Asset From Resources: ${this.mPath}`);
            this.OnResLoadFaild();
            return false;
        }
        this.State = ResState.Ready;
        return true;
    }

    public LoadAsync(): void {
        if (!this.CheckLoadAble() || !this.mAssetName) {
            return;
        }
        this.State = ResState.Loading;
        ResMgr.GetInstance(ResMgr).PushIEnumeratorTask(this);
    }

    public DoLoadAsync(finishCallback: () => void): void {
        if (this.RefCount <= 0) {
            this.OnResLoadFaild();
            if (finishCallback) {
                finishCallback();
            }
            return;
        }
        const type = this.AssetType || cc.Asset;
        cc.resources.load(this.mPath, type as any, (err, asset) => {
            if (err || !asset) {
                LogKit.E(`Failed to Load Resources: ${this.mAssetName} ${err}`);
                this.OnResLoadFaild();
            } else {
                this.mAsset = asset;
                this.State = ResState.Ready;
            }
            if (finishCallback) {
                finishCallback();
            }
        });
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(ResourcesRes).Recycle(this);
    }
}

// #endregion

// #region BundleRes

export class BundleRes extends Res {

    private mBundle: cc.AssetManager.Bundle = null;

    public static Allocate(bundleName: string): BundleRes {
        const res = SafeObjectPool.Instance(BundleRes).Allocate();
        res.AssetName = bundleName;
        res.AssetType = AssetBundleAssetType;
        res.OwnerBundleName = bundleName;
        return res;
    }

    public get Bundle(): cc.AssetManager.Bundle {
        return this.mBundle;
    }

    public LoadSync(): boolean {
        if (!this.CheckLoadAble()) {
            return false;
        }
        this.State = ResState.Loading;
        this.mBundle = cc.assetManager.getBundle(this.mAssetName);
        if (!this.mBundle) {
            LogKit.E(`Failed Load Bundle(sync cache miss): ${this.mAssetName}`);
            this.OnResLoadFaild();
            return false;
        }
        this.mAsset = this.mBundle;
        this.State = ResState.Ready;
        return true;
    }

    public LoadAsync(): void {
        if (!this.CheckLoadAble()) {
            return;
        }
        this.State = ResState.Loading;
        ResMgr.GetInstance(ResMgr).PushIEnumeratorTask(this);
    }

    public DoLoadAsync(finishCallback: () => void): void {
        if (this.RefCount <= 0) {
            this.OnResLoadFaild();
            if (finishCallback) {
                finishCallback();
            }
            return;
        }
        const cached = cc.assetManager.getBundle(this.mAssetName);
        if (cached) {
            this.mBundle = cached;
            this.mAsset = cached;
            this.State = ResState.Ready;
            if (finishCallback) {
                finishCallback();
            }
            return;
        }
        cc.assetManager.loadBundle(this.mAssetName, (err, bundle) => {
            if (err || !bundle) {
                LogKit.E(`Failed Load Bundle: ${this.mAssetName}`);
                this.OnResLoadFaild();
            } else {
                this.mBundle = bundle;
                this.mAsset = bundle;
                this.State = ResState.Ready;
            }
            if (finishCallback) {
                finishCallback();
            }
        });
    }

    public override GetDependResList(): string[] {
        return null;
    }

    protected override OnReleaseRes(): void {
        if (this.mBundle) {
            cc.assetManager.removeBundle(this.mBundle);
            this.mBundle = null;
        }
        this.mAsset = null;
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(BundleRes).Recycle(this);
    }
}

// #endregion

// #region BundleAssetRes

export class BundleAssetRes extends Res {

    private mOwnerBundleName: string = "";
    private mLoadPath: string = "";

    public static Allocate(name: string, ownerBundleName: string, assetType: AssetType, originalName?: string): BundleAssetRes {
        const res = SafeObjectPool.Instance(BundleAssetRes).Allocate();
        res.AssetName = name;
        res.mOwnerBundleName = ownerBundleName;
        res.OwnerBundleName = ownerBundleName;
        res.mLoadPath = originalName || name;
        res.AssetType = assetType;
        return res;
    }

    public LoadSync(): boolean {
        if (!this.CheckLoadAble() || !this.mOwnerBundleName) {
            return false;
        }
        this.HoldDependRes();
        this.State = ResState.Loading;
        const bundleResKeys = ResSearchKeys.Allocate(this.mOwnerBundleName, null, AssetBundleAssetType);
        const bundleRes = ResMgr.GetInstance(ResMgr).GetRes(bundleResKeys, true);
        bundleResKeys.Recycle2Cache();
        if (!bundleRes.LoadSync()) {
            this.OnResLoadFaild();
            return false;
        }
        const bundle = (bundleRes as BundleRes).Bundle;
        const type = this.AssetType || cc.Asset;
        this.mAsset = bundle.get(this.mLoadPath, type as any);
        if (!this.mAsset) {
            LogKit.E(`Failed Load Bundle Asset: ${this.mAssetName}`);
            this.OnResLoadFaild();
            return false;
        }
        this.State = ResState.Ready;
        return true;
    }

    public LoadAsync(): void {
        if (!this.CheckLoadAble()) {
            return;
        }
        this.State = ResState.Loading;
        ResMgr.GetInstance(ResMgr).PushIEnumeratorTask(this);
    }

    public DoLoadAsync(finishCallback: () => void): void {
        if (this.RefCount <= 0) {
            this.OnResLoadFaild();
            if (finishCallback) {
                finishCallback();
            }
            return;
        }
        this.HoldDependRes();
        const bundleKeys = ResSearchKeys.Allocate(this.mOwnerBundleName, null, AssetBundleAssetType);
        const bundleRes = ResMgr.GetInstance(ResMgr).GetRes(bundleKeys, true);
        bundleKeys.Recycle2Cache();
        const loadAsset = () => {
            const bundle = (bundleRes as BundleRes).Bundle;
            const type = this.AssetType || cc.Asset;
            const path = this.mLoadPath;
            bundle.load(path, type as any, (err, asset) => {
                if (err || !asset) {
                    LogKit.E(`Failed Load Bundle Asset Async: ${path}`);
                    this.OnResLoadFaild();
                } else {
                    this.mAsset = asset;
                    this.State = ResState.Ready;
                }
                if (finishCallback) {
                    finishCallback();
                }
            });
        };
        if (bundleRes.State === ResState.Ready) {
            loadAsset();
        } else {
            bundleRes.RegisteOnResLoadDoneEvent((ok) => {
                if (ok) {
                    loadAsset();
                } else {
                    this.OnResLoadFaild();
                    if (finishCallback) {
                        finishCallback();
                    }
                }
            });
            if (bundleRes.State === ResState.Waiting) {
                bundleRes.LoadAsync();
            }
        }
    }

    public override GetDependResList(): string[] {
        return [this.mOwnerBundleName];
    }

    protected override OnReleaseRes(): void {
        this.UnHoldDependRes();
        super.OnReleaseRes();
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(BundleAssetRes).Recycle(this);
    }
}

// #endregion

// #region ResFactory

export interface IResCreator {
    Match(resSearchKeys: ResSearchKeys): boolean;
    Create(resSearchKeys: ResSearchKeys): IRes;
}

export class ResourcesResCreator implements IResCreator {

    public Match(resSearchKeys: ResSearchKeys): boolean {
        return resSearchKeys.AssetName.indexOf("resources/") === 0 ||
            resSearchKeys.AssetName.indexOf("resources://") === 0;
    }

    public Create(resSearchKeys: ResSearchKeys): IRes {
        const original = resSearchKeys.OriginalAssetName || resSearchKeys.AssetName;
        const resourcesRes = ResourcesRes.Allocate(
            resSearchKeys.AssetName,
            (original.indexOf("resources://") === 0 || resSearchKeys.AssetName.indexOf("resources://") === 0)
                ? InternalResNamePrefixType.Url
                : InternalResNamePrefixType.Folder,
            original,
        );
        resourcesRes.AssetType = resSearchKeys.AssetType;
        return resourcesRes;
    }
}

export class BundleResCreator implements IResCreator {

    public Match(resSearchKeys: ResSearchKeys): boolean {
        return resSearchKeys.AssetType === AssetBundleAssetType;
    }

    public Create(resSearchKeys: ResSearchKeys): IRes {
        return BundleRes.Allocate(resSearchKeys.AssetName);
    }
}

export class BundleAssetResCreator implements IResCreator {

    public Match(resSearchKeys: ResSearchKeys): boolean {
        return resSearchKeys.OwnerBundle != null && resSearchKeys.AssetType !== AssetBundleAssetType;
    }

    public Create(resSearchKeys: ResSearchKeys): IRes {
        return BundleAssetRes.Allocate(
            resSearchKeys.AssetName,
            resSearchKeys.OwnerBundle,
            resSearchKeys.AssetType,
            resSearchKeys.OriginalAssetName
        );
    }
}

export class ResFactory {

    public static mResCreators: IResCreator[] = [
        new ResourcesResCreator(),
        new BundleResCreator(),
        new BundleAssetResCreator(),
    ];

    public static Create(resSearchKeys: ResSearchKeys): IRes {
        for (let i = 0; i < ResFactory.mResCreators.length; i++) {
            const creator = ResFactory.mResCreators[i];
            if (creator.Match(resSearchKeys)) {
                return creator.Create(resSearchKeys);
            }
        }
        LogKit.E(`Failed to Create Res. Not Find By ResSearchKeys: ${resSearchKeys.AssetName}`);
        return null;
    }

    public static AddResCreator(resCreator: IResCreator): void {
        ResFactory.mResCreators.push(resCreator);
    }
}

// #endregion

// #region ResMgr

const { ccclass } = cc._decorator;

@ccclass
export class ResMgr extends MonoSingleton {

    private static mResMgrInited: boolean = false;
    private static mIsApplicationQuit: boolean = false;

    public static get ResMgrInited(): boolean {
        return ResMgr.mResMgrInited;
    }

    public static get IsApplicationQuit(): boolean {
        return ResMgr.mIsApplicationQuit;
    }

    private readonly mTable: ResTable = new ResTable();
    private mIsResMapDirty: boolean = false;
    private readonly mIEnumeratorTaskStack: IEnumeratorTask[] = [];
    private mCurrentTaskCount: number = 0;
    private readonly mMaxTaskCount: number = 8;

    public get Count(): number {
        return this.mTable.Count;
    }

    public static Init(): void {
        if (ResMgr.mResMgrInited) {
            return;
        }
        ResMgr.mResMgrInited = true;
        SafeObjectPool.Instance(BundleRes).Init(40, 20);
        SafeObjectPool.Instance(BundleAssetRes).Init(40, 20);
        SafeObjectPool.Instance(ResourcesRes).Init(40, 20);
        SafeObjectPool.Instance(ResSearchKeys).Init(40, 20);
        SafeObjectPool.Instance(ResLoader).Init(40, 20);
        ResMgr.GetInstance(ResMgr).OnSingletonInit();
    }

    public static InitAsync(done?: () => void): void {
        if (ResMgr.mResMgrInited) {
            if (done) {
                done();
            }
            return;
        }
        ResMgr.Init();
        if (done) {
            setTimeout(done, 0);
        }
    }

    public ClearOnUpdate(): void {
        this.mIsResMapDirty = true;
    }

    public PushIEnumeratorTask(task: IEnumeratorTask): void {
        if (!task) {
            return;
        }
        this.mIEnumeratorTaskStack.push(task);
        this.TryStartNextIEnumeratorTask();
    }

    public GetRes(resSearchKeys: ResSearchKeys, createNew: boolean = false): IRes {
        let res = this.mTable.GetResBySearchKeys(resSearchKeys);
        if (res) {
            return res;
        }
        if (!createNew) {
            return null;
        }
        res = ResFactory.Create(resSearchKeys);
        if (res) {
            this.mTable.Add(res);
        }
        return res;
    }

    protected update(): void {
        if (this.mIsResMapDirty) {
            this.RemoveUnusedRes();
        }
    }

    private RemoveUnusedRes(): void {
        if (!this.mIsResMapDirty) {
            return;
        }
        this.mIsResMapDirty = false;
        const all = this.mTable.ToArray();
        for (let i = 0; i < all.length; i++) {
            const res = all[i];
            if (res.RefCount <= 0 && res.State !== ResState.Loading) {
                if (res.ReleaseRes()) {
                    this.mTable.Remove(res);
                    res.Recycle2Cache();
                }
            }
        }
    }

    private TryStartNextIEnumeratorTask(): void {
        while (this.mCurrentTaskCount < this.mMaxTaskCount && this.mIEnumeratorTaskStack.length > 0) {
            const task = this.mIEnumeratorTaskStack.shift();
            this.mCurrentTaskCount++;
            task.DoLoadAsync(() => {
                this.mCurrentTaskCount--;
                this.TryStartNextIEnumeratorTask();
            });
        }
    }

    protected onDestroy(): void {
        ResMgr.mIsApplicationQuit = true;
        super.onDestroy();
    }
}

// #endregion

// #region ResLoader

export interface IResLoader {
    LoadResSync(resSearchKeys: ResSearchKeys): IRes;
    LoadAssetSync(resSearchKeys: ResSearchKeys): any;
    Add2Load(resSearchKeys: ResSearchKeys, listener?: (result: boolean, res: IRes) => void, lastOrder?: boolean): void;
    LoadAsync(listener?: () => void): void;
    ReleaseAllRes(): void;
    UnloadAllInstantiateRes(flag: boolean): void;
    ReleaseRes(resName: string): void;
    Recycle2Cache(): void;
    Progress: number;
}

export class ResLoader implements IResLoader, IPoolType, IPoolable {

    private readonly mResList: IRes[] = [];
    private readonly mWaitLoadList: IRes[] = [];
    private mListener: () => void = null;
    private mLoadingCount: number = 0;
    private mCallbackRecordList: { res: IRes; listener: (result: boolean, res: IRes) => void }[] = [];
    private mObject2Unload: cc.Node[] = null;

    public IsRecycled: boolean = false;

    public static Allocate(): ResLoader {
        return SafeObjectPool.Instance(ResLoader).Allocate();
    }

    public Recycle2Cache(): void {
        if (this.mObject2Unload) {
            for (let i = 0; i < this.mObject2Unload.length; i++) {
                ResUnloadHelper.DestroyObject(this.mObject2Unload[i]);
            }
            this.mObject2Unload = null;
        }
        SafeObjectPool.Instance(ResLoader).Recycle(this);
    }

    public AddObjectForDestroyWhenRecycle2Cache(obj: cc.Node): void {
        if (!this.mObject2Unload) {
            this.mObject2Unload = [];
        }
        this.mObject2Unload.push(obj);
    }

    public get Progress(): number {
        if (this.mWaitLoadList.length === 0) {
            return 1;
        }
        const unit = 1.0 / this.mResList.length;
        let currentValue = unit * (this.mResList.length - this.mLoadingCount);
        for (let i = 0; i < this.mWaitLoadList.length; i++) {
            currentValue += unit * this.mWaitLoadList[i].Progress;
        }
        return currentValue;
    }

    public LoadResSync(resSearchKeys: ResSearchKeys): IRes {
        this.Add2Load(resSearchKeys);
        this.LoadSync();
        const res = ResMgr.GetInstance(ResMgr).GetRes(resSearchKeys, false);
        if (!res) {
            LogKit.E(`Failed to Load Res: ${resSearchKeys.AssetName}`);
            return null;
        }
        return res;
    }

    private LoadSync(): void {
        while (this.mWaitLoadList.length > 0) {
            const first = this.mWaitLoadList.shift();
            this.mLoadingCount--;
            if (!first) {
                return;
            }
            first.LoadSync();
        }
    }

    public LoadAssetSync(resSearchKeys: ResSearchKeys): any {
        const retAsset = this.LoadResSync(resSearchKeys).Asset;
        resSearchKeys.Recycle2Cache();
        return retAsset;
    }

    public Add2Load(
        resSearchKeys: ResSearchKeys,
        listener: (result: boolean, res: IRes) => void = null,
        lastOrder: boolean = true
    ): void {
        let res = ResLoader.FindResInArray(this.mResList, resSearchKeys);
        if (res) {
            if (listener) {
                this.AddResListenerRecord(res, listener);
                res.RegisteOnResLoadDoneEvent(listener);
            }
            return;
        }

        res = ResMgr.GetInstance(ResMgr).GetRes(resSearchKeys, true);
        if (!res) {
            return;
        }

        if (listener) {
            this.AddResListenerRecord(res, listener);
            res.RegisteOnResLoadDoneEvent(listener);
        }

        const depends = res.GetDependResList();
        if (depends) {
            for (let i = 0; i < depends.length; i++) {
                const searchRule = ResSearchKeys.Allocate(depends[i], null, AssetBundleAssetType);
                this.Add2Load(searchRule);
                searchRule.Recycle2Cache();
            }
        }

        this.AddRes2Array(res, lastOrder);
    }

    public LoadAsync(listener: () => void = null): void {
        this.mListener = listener;
        this.DoLoadAsync();
    }

    public ReleaseRes(resName: string): void {
        if (!resName) {
            return;
        }
        const resSearchRule = ResSearchKeys.Allocate(resName);
        const res = ResMgr.GetInstance(ResMgr).GetRes(resSearchRule);
        resSearchRule.Recycle2Cache();
        if (!res) {
            return;
        }
        const waitIdx = this.mWaitLoadList.indexOf(res);
        if (waitIdx >= 0) {
            this.mWaitLoadList.splice(waitIdx, 1);
            this.mLoadingCount--;
            if (this.mLoadingCount === 0) {
                this.mListener = null;
            }
        }
        const listIdx = this.mResList.indexOf(res);
        if (listIdx >= 0) {
            res.UnRegisteOnResLoadDoneEvent(this.OnResLoadFinish);
            res.Release();
            this.mResList.splice(listIdx, 1);
            ResMgr.GetInstance(ResMgr).ClearOnUpdate();
        }
    }

    public ReleaseAllRes(): void {
        this.mListener = null;
        this.mLoadingCount = 0;
        this.mWaitLoadList.length = 0;
        if (this.mResList.length > 0) {
            for (let i = this.mResList.length - 1; i >= 0; i--) {
                this.mResList[i].UnRegisteOnResLoadDoneEvent(this.OnResLoadFinish);
                this.mResList[i].Release();
            }
            this.mResList.length = 0;
            if (!ResMgr.IsApplicationQuit) {
                ResMgr.GetInstance(ResMgr).ClearOnUpdate();
            }
        }
        this.RemoveAllCallbacks(true);
    }

    public UnloadAllInstantiateRes(flag: boolean): void {
        for (let i = this.mResList.length - 1; i >= 0; i--) {
            if (this.mResList[i].UnloadImage(flag)) {
                const res = this.mResList[i];
                const waitIdx = this.mWaitLoadList.indexOf(res);
                if (waitIdx >= 0) {
                    this.mWaitLoadList.splice(waitIdx, 1);
                    this.mLoadingCount--;
                }
                this.RemoveCallback(res, true);
                res.UnRegisteOnResLoadDoneEvent(this.OnResLoadFinish);
                res.Release();
                this.mResList.splice(i, 1);
            }
        }
        ResMgr.GetInstance(ResMgr).ClearOnUpdate();
    }

    private DoLoadAsync(): void {
        if (this.mLoadingCount === 0) {
            if (this.mListener) {
                const callback = this.mListener;
                this.mListener = null;
                callback();
            }
            return;
        }
        for (let i = 0; i < this.mWaitLoadList.length; i++) {
            const res = this.mWaitLoadList[i];
            if (res.IsDependResLoadFinish()) {
                this.mWaitLoadList.splice(i, 1);
                i--;
                if (res.State !== ResState.Ready) {
                    res.RegisteOnResLoadDoneEvent(this.OnResLoadFinish);
                    res.LoadAsync();
                } else {
                    this.mLoadingCount--;
                }
            }
        }
    }

    private readonly OnResLoadFinish = (result: boolean, res: IRes): void => {
        this.mLoadingCount--;
        this.DoLoadAsync();
        if (this.mLoadingCount === 0) {
            this.RemoveAllCallbacks(false);
            if (this.mListener) {
                const cb = this.mListener;
                this.mListener = null;
                cb();
            }
        }
    };

    private AddRes2Array(res: IRes, lastOrder: boolean): void {
        const searchRule = ResSearchKeys.Allocate(res.AssetName, res.OwnerBundleName, res.AssetType);
        const oldRes = ResLoader.FindResInArray(this.mResList, searchRule);
        searchRule.Recycle2Cache();
        if (oldRes) {
            return;
        }
        res.Retain();
        this.mResList.push(res);
        if (res.State !== ResState.Ready) {
            this.mLoadingCount++;
            if (lastOrder) {
                this.mWaitLoadList.push(res);
            } else {
                this.mWaitLoadList.unshift(res);
            }
        }
    }

    private static FindResInArray(list: IRes[], resSearchKeys: ResSearchKeys): IRes {
        if (!list) {
            return null;
        }
        for (let i = list.length - 1; i >= 0; i--) {
            if (resSearchKeys.Match(list[i])) {
                return list[i];
            }
        }
        return null;
    }

    private AddResListenerRecord(res: IRes, listener: (result: boolean, res: IRes) => void): void {
        this.mCallbackRecordList.push({ res, listener });
    }

    private RemoveCallback(res: IRes, release: boolean): void {
        for (let i = this.mCallbackRecordList.length - 1; i >= 0; i--) {
            if (this.mCallbackRecordList[i].res.AssetName === res.AssetName) {
                if (release) {
                    this.mCallbackRecordList[i].res.UnRegisteOnResLoadDoneEvent(this.mCallbackRecordList[i].listener);
                }
                this.mCallbackRecordList.splice(i, 1);
            }
        }
    }

    private RemoveAllCallbacks(release: boolean): void {
        if (release) {
            for (let i = 0; i < this.mCallbackRecordList.length; i++) {
                this.mCallbackRecordList[i].res.UnRegisteOnResLoadDoneEvent(this.mCallbackRecordList[i].listener);
            }
        }
        this.mCallbackRecordList.length = 0;
    }

    public OnRecycled(): void {
        this.ReleaseAllRes();
    }
}

// #endregion

// #region IResLoader Extensions

function isComponentType(type: AssetType): boolean {
    if (!type || !type.prototype) {
        return false;
    }
    return type.prototype instanceof cc.Component;
}

export function ResLoaderLoadSync<T>(
    self: IResLoader,
    arg1: string,
    arg2?: string | AssetType,
    arg3?: AssetType
): T {
    let ownerBundle: string = null;
    let assetName: string = arg1;
    let assetType: AssetType = null;
    if (typeof arg2 === "string") {
        ownerBundle = arg1;
        assetName = arg2;
        assetType = arg3 || null;
    } else {
        assetType = (arg2 as AssetType) || null;
    }
    const type = assetType || cc.Asset;
    const keys = ResSearchKeys.Allocate(assetName, ownerBundle, type);
    const ret = self.LoadAssetSync(keys) as T;
    return ret;
}

export function ResLoaderAdd2Load(
    self: IResLoader,
    assetName: string,
    listener: (result: boolean, res: IRes) => void = null,
    lastOrder: boolean = true,
    assetType: AssetType = null
): void {
    const keys = ResSearchKeys.Allocate(assetName, null, assetType);
    self.Add2Load(keys, listener, lastOrder);
    keys.Recycle2Cache();
}

export function ResLoaderAdd2LoadWithBundle(
    self: IResLoader,
    ownerBundle: string,
    assetName: string,
    listener: (result: boolean, res: IRes) => void = null,
    lastOrder: boolean = true,
    assetType: AssetType = null
): void {
    const keys = ResSearchKeys.Allocate(assetName, ownerBundle, assetType);
    self.Add2Load(keys, listener, lastOrder);
    keys.Recycle2Cache();
}

export function ResLoaderLoadSceneSync(self: IResLoader, sceneName: string): void {
    const keys = ResSearchKeys.Allocate(sceneName);
    if (keys.OwnerBundle) {
        self.LoadResSync(keys);
    }
    keys.Recycle2Cache();
    cc.director.loadScene(sceneName);
}

export function ResLoaderLoadSceneAsync(
    self: IResLoader,
    sceneName: string,
    onLoaded?: () => void
): void {
    const keys = ResSearchKeys.Allocate(sceneName);
    self.Add2Load(keys, () => {
        keys.Recycle2Cache();
        cc.director.loadScene(sceneName, onLoaded);
    });
    self.LoadAsync();
}

// #endregion

// #region ResKit

export class ResKit {

    public static Init(): void {
        ResMgr.Init();
    }

    public static InitAsync(done?: () => void): void {
        ResMgr.InitAsync(done);
    }

    /** Long-lived loader so LoadAsync assets are not released when a one-shot loader recycles. */
    private static persistLoader: IResLoader = null;

    private static GetPersistLoader(): IResLoader {
        ResKit.Init();
        if (!ResKit.persistLoader) {
            ResKit.persistLoader = ResLoader.Allocate();
        }
        return ResKit.persistLoader;
    }

    /**
     * Normalize a path under assets/resources/ for ResKit's ResourcesRes.
     * Accepts: "Prefab/...", "resources/Prefab/...", "resources://Prefab/..."
     */
    public static ToResourcesAssetName(pathUnderResources: string): string {
        if (!pathUnderResources) {
            return "";
        }
        if (pathUnderResources.indexOf("resources://") === 0
            || pathUnderResources.indexOf("resources/") === 0) {
            return pathUnderResources;
        }
        return "resources://" + pathUnderResources;
    }

    /**
     * Load any asset from the built-in `resources` bundle and keep it retained.
     * Path is relative to assets/resources/, no extension.
     * Example: `ResKit.LoadAsync("Prefab/GameComm/prefab/GameRoomMenu", cc.Prefab)`
     */
    public static LoadAsync<T extends cc.Asset>(
        pathUnderResources: string,
        assetType: AssetType = cc.Asset,
    ): Promise<T | null> {
        return new Promise((resolve) => {
            const assetName = ResKit.ToResourcesAssetName(pathUnderResources);
            if (!assetName) {
                resolve(null);
                return;
            }
            const loader = ResKit.GetPersistLoader();
            ResLoaderAdd2Load(
                loader,
                assetName,
                (ok, res) => {
                    const asset = ok && res ? (res.Asset as T) : null;
                    if (!asset) {
                        LogKit.W("[ResKit] LoadAsync failed: {0}", assetName);
                    }
                    // Do NOT Recycle2Cache(loader) — persistLoader holds Retain until process exit.
                    resolve(asset || null);
                },
                true,
                assetType,
            );
            loader.LoadAsync();
        });
    }

    /** Sync load from resources — asset must already be cached / preloaded. */
    public static LoadSync<T extends cc.Asset>(
        pathUnderResources: string,
        assetType: AssetType = cc.Asset,
    ): T | null {
        const assetName = ResKit.ToResourcesAssetName(pathUnderResources);
        if (!assetName) {
            return null;
        }
        const loader = ResKit.GetPersistLoader();
        return ResLoaderLoadSync<T>(loader, assetName, assetType) || null;
    }

    /**
     * Load a Prefab from resources by path (relative to assets/resources/, no extension).
     * Example: `ResKit.LoadPrefabAsync("Prefab/GameComm/prefab/GameRoomMenu")`
     */
    public static LoadPrefabAsync(pathUnderResources: string): Promise<cc.Prefab | null> {
        return ResKit.LoadAsync<cc.Prefab>(pathUnderResources, cc.Prefab);
    }

    /** Sync variant — resources asset must already be loaded / cached. */
    public static LoadPrefabSync(pathUnderResources: string): cc.Prefab | null {
        return ResKit.LoadSync<cc.Prefab>(pathUnderResources, cc.Prefab);
    }
}

// #endregion
