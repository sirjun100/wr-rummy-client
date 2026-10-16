/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * UIKit for Cocos Creator (TypeScript)
 * API aligned with Unity QFramework UIKit (core runtime)
 ****************************************************************************/


import * as cc from 'cc';
import { LogKit } from "../coreKit/logKit/LogKit";
import { IPoolable, IPoolType, ListPool, SafeObjectPool } from "../coreKit/poolKit/PoolKit";
import { MonoSingleton } from "../coreKit/singletonKit/SingletonKit";
import {
    IRes,
    ResLoader,
    ResLoaderAdd2Load,
    ResLoaderAdd2LoadWithBundle,
    ResLoaderLoadSync,
} from "../resKit/ResKit";

type PanelConstructor = new () => UIPanel;

// #region Enums

export enum PanelState {
    Opening = 0,
    Hide = 1,
    Closed = 2,
}

export enum PanelOpenType {
    Single,
    Multiple,
}

export enum UILevel {
    Bg = -2,
    Common = 0,
    PopUI = 2,
    CanvasPanel = 100,
}

// #endregion

// #region IUIData / IPanel

export interface IUIData {
}

export class UIPanelData implements IUIData {
}

export interface IPanel {
    Transform: cc.Node;
    Loader: IPanelLoader;
    Info: PanelInfo;
    State: PanelState;
    Init(uiData?: IUIData): void;
    Open(uiData?: IUIData): void;
    Show(): void;
    Hide(): void;
    Close(destroy?: boolean): void;
}

// #endregion

// #region PanelSearchKeys / PanelInfo

export class PanelSearchKeys implements IPoolType, IPoolable {

    public PanelType: PanelConstructor = null;
    public AssetBundleName: string = null;
    public GameObjName: string = null;
    public Level: UILevel = UILevel.Common;
    public UIData: IUIData = null;
    public Panel: IPanel = null;
    public OpenType: PanelOpenType = PanelOpenType.Single;
    public IsRecycled: boolean = false;

    public static Allocate(): PanelSearchKeys {
        return SafeObjectPool.Instance(PanelSearchKeys).Allocate();
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(PanelSearchKeys).Recycle(this);
    }

    public OnRecycled(): void {
        this.PanelType = null;
        this.AssetBundleName = null;
        this.GameObjName = null;
        this.UIData = null;
        this.Panel = null;
        this.Level = UILevel.Common;
        this.OpenType = PanelOpenType.Single;
    }
}

export class PanelInfo implements IPoolType, IPoolable {

    public UIData: IUIData = null;
    public Level: UILevel = UILevel.Common;
    public AssetBundleName: string = null;
    public GameObjName: string = null;
    public PanelType: PanelConstructor = null;
    public IsRecycled: boolean = false;

    public static Allocate(
        gameObjName: string,
        level: UILevel,
        uiData: IUIData,
        panelType: PanelConstructor,
        assetBundleName: string
    ): PanelInfo {
        const panelInfo = SafeObjectPool.Instance(PanelInfo).Allocate();
        panelInfo.GameObjName = gameObjName;
        panelInfo.Level = level;
        panelInfo.UIData = uiData;
        panelInfo.PanelType = panelType;
        panelInfo.AssetBundleName = assetBundleName;
        return panelInfo;
    }

    public Recycle2Cache(): void {
        SafeObjectPool.Instance(PanelInfo).Recycle(this);
    }

    public OnRecycled(): void {
        this.UIData = null;
        this.AssetBundleName = null;
        this.GameObjName = null;
        this.PanelType = null;
        this.Level = UILevel.Common;
    }
}

// #endregion

// #region UIPanelTable

class UIKitTableIndex<TKey, TDataItem> {

    private mIndex: Map<TKey, TDataItem[]> = new Map();
    private readonly mGetKeyByDataItem: (item: TDataItem) => TKey;

    public constructor(keyGetter: (item: TDataItem) => TKey) {
        this.mGetKeyByDataItem = keyGetter;
    }

    public get Dictionary(): Map<TKey, TDataItem[]> {
        return this.mIndex;
    }

    public Add(dataItem: TDataItem): void {
        const key = this.mGetKeyByDataItem(dataItem);
        let list = this.mIndex.get(key);
        if (list) {
            list.push(dataItem);
        } else {
            list = ListPool.Get<TDataItem>();
            list.push(dataItem);
            this.mIndex.set(key, list);
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

    public Get(key: TKey): TDataItem[] {
        const list = this.mIndex.get(key);
        return list ? list : [];
    }

    public Clear(): void {
        this.mIndex.forEach((value) => {
            value.length = 0;
            ListPool.Release(value);
        });
        this.mIndex.clear();
    }
}

export class UIPanelTable {

    public GameObjectNameIndex: UIKitTableIndex<string, IPanel> =
        new UIKitTableIndex<string, IPanel>((panel) => panel.Transform.name);

    public TypeIndex: UIKitTableIndex<Function, IPanel> =
        new UIKitTableIndex<Function, IPanel>((panel) => (panel as object).constructor);

    public Add(item: IPanel): void {
        this.GameObjectNameIndex.Add(item);
        this.TypeIndex.Add(item);
    }

    public Remove(item: IPanel): void {
        this.GameObjectNameIndex.Remove(item);
        this.TypeIndex.Remove(item);
    }

    public Clear(): void {
        this.GameObjectNameIndex.Clear();
        this.TypeIndex.Clear();
    }

    public GetPanelsByPanelSearchKeys(panelSearchKeys: PanelSearchKeys): IPanel[] {
        if (panelSearchKeys.PanelType && (panelSearchKeys.GameObjName || panelSearchKeys.Panel)) {
            return this.TypeIndex.Get(panelSearchKeys.PanelType).filter((p) => {
                return p.Transform.name === panelSearchKeys.GameObjName || p === panelSearchKeys.Panel;
            });
        }
        if (panelSearchKeys.PanelType) {
            return this.TypeIndex.Get(panelSearchKeys.PanelType).slice();
        }
        if (panelSearchKeys.Panel) {
            return this.GameObjectNameIndex.Get(panelSearchKeys.Panel.Transform.name)
                .filter((p) => p === panelSearchKeys.Panel);
        }
        if (panelSearchKeys.GameObjName) {
            return this.GameObjectNameIndex.Get(panelSearchKeys.GameObjName).slice();
        }
        return [];
    }

    public ToArray(): IPanel[] {
        const result: IPanel[] = [];
        this.GameObjectNameIndex.Dictionary.forEach((list) => {
            for (let i = 0; i < list.length; i++) {
                result.push(list[i]);
            }
        });
        return result;
    }
}

// #endregion

// #region Panel Loader

export interface IPanelLoader {
    LoadPanelPrefab(panelSearchKeys: PanelSearchKeys): cc.Prefab;
    LoadPanelPrefabAsync(panelSearchKeys: PanelSearchKeys, onPanelPrefabLoad: (prefab: cc.Prefab) => void): void;
    Unload(): void;
}

export interface IPanelLoaderPool {
    AllocateLoader(): IPanelLoader;
    RecycleLoader(panelLoader: IPanelLoader): void;
}

export abstract class AbstractPanelLoaderPool implements IPanelLoaderPool {

    private readonly mPool: IPanelLoader[] = [];

    public AllocateLoader(): IPanelLoader {
        return this.mPool.length > 0 ? this.mPool.pop() : this.CreatePanelLoader();
    }

    protected abstract CreatePanelLoader(): IPanelLoader;

    public RecycleLoader(panelLoader: IPanelLoader): void {
        this.mPool.push(panelLoader);
    }
}

function ResolvePanelResourceName(panelSearchKeys: PanelSearchKeys): string {
    if (panelSearchKeys.GameObjName) {
        return panelSearchKeys.GameObjName;
    }
    if (panelSearchKeys.PanelType) {
        const registered = UIKit.GetRegisteredPrefabName(panelSearchKeys.PanelType);
        if (registered) {
            return registered;
        }
        return panelSearchKeys.PanelType.name;
    }
    return null;
}

function StripResourcesPrefix(path: string): string {
    if (!path) {
        return path;
    }
    if (path.indexOf("resources://") === 0) {
        return path.substring("resources://".length);
    }
    if (path.indexOf("resources/") === 0) {
        return path.substring("resources/".length);
    }
    return path;
}

export class DefaultPanelLoader implements IPanelLoader {

    private mPanelPrefab: cc.Prefab = null;

    public LoadPanelPrefab(panelSearchKeys: PanelSearchKeys): cc.Prefab {
        const name = StripResourcesPrefix(ResolvePanelResourceName(panelSearchKeys));
        this.mPanelPrefab = cc.resources.get(name, cc.Prefab) as cc.Prefab;
        return this.mPanelPrefab;
    }

    public LoadPanelPrefabAsync(panelSearchKeys: PanelSearchKeys, onPanelLoad: (prefab: cc.Prefab) => void): void {
        const name = StripResourcesPrefix(ResolvePanelResourceName(panelSearchKeys));
        cc.resources.load(name, cc.Prefab, (err, prefab) => {
            if (err || !prefab) {
                LogKit.E(`Failed to load panel prefab: ${name}`);
                onPanelLoad(null);
                return;
            }
            this.mPanelPrefab = prefab as cc.Prefab;
            onPanelLoad(this.mPanelPrefab);
        });
    }

    public Unload(): void {
        this.mPanelPrefab = null;
    }
}

export class DefaultPanelLoaderPool extends AbstractPanelLoaderPool {

    protected CreatePanelLoader(): IPanelLoader {
        return new DefaultPanelLoader();
    }
}

export class ResKitPanelLoader implements IPanelLoader {

    private mResLoader: ResLoader = null;

    private EnsureLoader(): ResLoader {
        if (!this.mResLoader) {
            this.mResLoader = ResLoader.Allocate();
        }
        return this.mResLoader;
    }

    public LoadPanelPrefab(panelSearchKeys: PanelSearchKeys): cc.Prefab {
        const loader = this.EnsureLoader();
        if (panelSearchKeys.PanelType && !panelSearchKeys.GameObjName) {
            const name = ResolvePanelResourceName(panelSearchKeys);
            return ResLoaderLoadSync<cc.Prefab>(loader, name, cc.Prefab);
        }
        if (panelSearchKeys.AssetBundleName) {
            return ResLoaderLoadSync<cc.Prefab>(
                loader,
                panelSearchKeys.AssetBundleName,
                panelSearchKeys.GameObjName,
                cc.Prefab
            );
        }
        return ResLoaderLoadSync<cc.Prefab>(loader, ResolvePanelResourceName(panelSearchKeys), cc.Prefab);
    }

    public LoadPanelPrefabAsync(panelSearchKeys: PanelSearchKeys, onLoad: (prefab: cc.Prefab) => void): void {
        const loader = this.EnsureLoader();
        const done = (success: boolean, res: IRes) => {
            if (success && res) {
                onLoad(res.Asset as cc.Prefab);
            } else {
                onLoad(null);
            }
        };
        if (panelSearchKeys.PanelType && !panelSearchKeys.GameObjName) {
            ResLoaderAdd2Load(loader, ResolvePanelResourceName(panelSearchKeys), done, true, cc.Prefab);
            loader.LoadAsync();
            return;
        }
        if (panelSearchKeys.AssetBundleName) {
            ResLoaderAdd2LoadWithBundle(
                loader,
                panelSearchKeys.AssetBundleName,
                panelSearchKeys.GameObjName,
                done,
                true,
                cc.Prefab
            );
            loader.LoadAsync();
            return;
        }
        ResLoaderAdd2Load(loader, ResolvePanelResourceName(panelSearchKeys), done, true, cc.Prefab);
        loader.LoadAsync();
    }

    public Unload(): void {
        if (this.mResLoader) {
            this.mResLoader.Recycle2Cache();
            this.mResLoader = null;
        }
    }
}

export class ResKitPanelLoaderPool extends AbstractPanelLoaderPool {

    protected CreatePanelLoader(): IPanelLoader {
        return new ResKitPanelLoader();
    }
}

// #endregion

// #region UIKitConfig

export class UIKitConfig {

    public PanelLoaderPool: IPanelLoaderPool = new DefaultPanelLoaderPool();

    public get Root(): UIRoot {
        return UIRoot.Instance;
    }

    public LoadPanel(panelSearchKeys: PanelSearchKeys): IPanel {
        const panelLoader = this.PanelLoaderPool.AllocateLoader();
        const panelPrefab = panelLoader.LoadPanelPrefab(panelSearchKeys);
        if (!panelPrefab) {
            LogKit.E(`LoadPanel failed: ${ResolvePanelResourceName(panelSearchKeys)}`);
            this.PanelLoaderPool.RecycleLoader(panelLoader);
            return null;
        }
        const node = cc.instantiate(panelPrefab);
        const panel = ResolvePanelComponent(node, panelSearchKeys);
        if (!panel) {
            LogKit.E(`Panel component missing on prefab: ${ResolvePanelResourceName(panelSearchKeys)}`);
            node.destroy();
            panelLoader.Unload();
            this.PanelLoaderPool.RecycleLoader(panelLoader);
            return null;
        }
        panel.Loader = panelLoader;
        return panel;
    }

    public LoadPanelAsync(panelSearchKeys: PanelSearchKeys, onPanelLoad: (panel: IPanel) => void): void {
        const panelLoader = this.PanelLoaderPool.AllocateLoader();
        panelLoader.LoadPanelPrefabAsync(panelSearchKeys, (panelPrefab) => {
            if (!panelPrefab) {
                panelLoader.Unload();
                this.PanelLoaderPool.RecycleLoader(panelLoader);
                onPanelLoad(null);
                return;
            }
            const node = cc.instantiate(panelPrefab);
            const panel = ResolvePanelComponent(node, panelSearchKeys);
            if (!panel) {
                LogKit.E(`Panel component missing on prefab: ${ResolvePanelResourceName(panelSearchKeys)}`);
                node.destroy();
                panelLoader.Unload();
                this.PanelLoaderPool.RecycleLoader(panelLoader);
                onPanelLoad(null);
                return;
            }
            panel.Loader = panelLoader;
            onPanelLoad(panel);
        });
    }

    public SetDefaultSizeOfPanel(panel: IPanel): void {
        const node = panel.Transform;
        node.setPosition(0, 0);
        node.setScale(1, 1);
        const widget = node.getComponent(cc.Widget);
        if (widget) {
            widget.isAlignTop = true;
            widget.isAlignBottom = true;
            widget.isAlignLeft = true;
            widget.isAlignRight = true;
            widget.top = 0;
            widget.bottom = 0;
            widget.left = 0;
            widget.right = 0;
            widget.updateAlignment();
        }
    }
}

function ResolvePanelComponent(node: cc.Node, panelSearchKeys: PanelSearchKeys): UIPanel {
    if (panelSearchKeys.PanelType) {
        let panel = node.getComponent(panelSearchKeys.PanelType as any) as UIPanel;
        if (!panel) {
            panel = node.addComponent(panelSearchKeys.PanelType as any) as UIPanel;
        }
        return panel;
    }
    return node.getComponent(UIPanel);
}

// #endregion

// #region UIRoot

const { ccclass } = cc._decorator;

@ccclass
export class UIRoot extends MonoSingleton {

    public Canvas: cc.Canvas = null;
    public Bg: cc.Node = null;
    public Common: cc.Node = null;
    public PopUI: cc.Node = null;
    public CanvasPanel: cc.Node = null;

    private static mInstance: UIRoot = null;

    public static get Instance(): UIRoot {
        if (UIRoot.mInstance && cc.isValid(UIRoot.mInstance.node)) {
            return UIRoot.mInstance;
        }
        const scene = cc.director.getScene();
        if (scene) {
            const existing = scene.getComponentsInChildren(UIRoot);
            if (existing && existing.length > 0) {
                UIRoot.mInstance = existing[0];
                return UIRoot.mInstance;
            }
        }
        UIRoot.mInstance = MonoSingleton.GetInstance(UIRoot);
        UIRoot.mInstance.node.name = "UIRoot";
        UIRoot.mInstance.EnsureHierarchy();
        return UIRoot.mInstance;
    }

    public OnSingletonInit(): void {
        this.EnsureHierarchy();
    }

    private EnsureHierarchy(): void {
        const scene = cc.director.getScene();
        const bootCanvas = scene ? this.findBootCanvas(scene) : null;
        if (bootCanvas) {
            // Points Boot.fire already has Main/Popup/Modal/Overlay — reuse them (no second Canvas).
            this.Canvas = bootCanvas.getComponent(cc.Canvas);
            this.Bg = this.EnsureChild(bootCanvas, "MainLayer");
            this.Common = this.EnsureChild(bootCanvas, "PopupLayer");
            this.PopUI = this.EnsureChild(bootCanvas, "ModalLayer");
            this.CanvasPanel = this.EnsureChild(bootCanvas, "OverlayLayer");
            if (this.node.parent !== bootCanvas) {
                this.node.parent = bootCanvas;
                this.node.name = "UIRoot";
                this.node.setSiblingIndex(bootCanvas.children.length - 1);
            }
            return;
        }

        let canvasNode = this.node.getChildByName("Canvas");
        if (!canvasNode) {
            canvasNode = new cc.Node("Canvas");
            this.node.addChild(canvasNode);
            this.Canvas = canvasNode.addComponent(cc.Canvas);
            canvasNode.addComponent(cc.Widget);
        } else {
            this.Canvas = canvasNode.getComponent(cc.Canvas);
            if (!this.Canvas) {
                this.Canvas = canvasNode.addComponent(cc.Canvas);
            }
        }

        this.Bg = this.EnsureChild(canvasNode, "Bg");
        this.Common = this.EnsureChild(canvasNode, "Common");
        this.PopUI = this.EnsureChild(canvasNode, "PopUI");
        this.CanvasPanel = this.EnsureChild(canvasNode, "CanvasPanel");
    }

    private findBootCanvas(scene: cc.Node): cc.Node | null {
        const direct = scene.getChildByName("Canvas");
        if (direct && direct.getChildByName("ModalLayer")) {
            return direct;
        }
        for (const child of scene.children) {
            const canvas = child.getChildByName("Canvas");
            if (canvas && canvas.getChildByName("ModalLayer")) {
                return canvas;
            }
            if (child.getComponent(cc.Canvas) && child.getChildByName("ModalLayer")) {
                return child;
            }
        }
        return null;
    }

    private EnsureChild(parent: cc.Node, name: string): cc.Node {
        let child = parent.getChildByName(name);
        if (!child) {
            child = new cc.Node(name);
            parent.addChild(child);
        }
        return child;
    }

    public SetResolution(width: number, height: number, matchOnWidthOrHeight: number): void {
        // Creator 3.x: design resolution lives on cc.view (Canvas.designResolution / fitWidth removed).
        const view = cc.view;
        if (view) {
            view.setDesignResolutionSize(width, height,
                matchOnWidthOrHeight < 0.5 ? cc.ResolutionPolicy.FIXED_WIDTH : cc.ResolutionPolicy.FIXED_HEIGHT);
        }
    }

    public GetResolution(): cc.Size {
        const view = cc.view;
        if (view) {
            return view.getDesignResolutionSize();
        }
        return cc.size(0, 0);
    }

    public SetLevelOfPanel(level: UILevel, panel: IPanel): void {
        const hasCanvas = !!panel.Transform.getComponent(cc.Canvas);
        if (hasCanvas || level === UILevel.CanvasPanel) {
            panel.Transform.parent = this.CanvasPanel;
        } else if (level === UILevel.Bg) {
            panel.Transform.parent = this.Bg;
        } else if (level === UILevel.PopUI) {
            panel.Transform.parent = this.PopUI;
        } else {
            panel.Transform.parent = this.Common;
        }
        if (panel.Info && panel.Info.Level !== level) {
            panel.Info.Level = level;
        }
    }

    protected onDestroy(): void {
        if (UIRoot.mInstance === this) {
            UIRoot.mInstance = null;
        }
        super.onDestroy();
    }
}

// #endregion

// #region UIPanel

/** Base panel — subclasses use @ccclass in their own script files. */
export abstract class UIPanel extends cc.Component implements IPanel {

    public Loader: IPanelLoader = null;
    public Info: PanelInfo = null;
    public State: PanelState = PanelState.Closed;

    protected mUIData: IUIData = null;
    private mOnClosed: () => void = null;

    public get Transform(): cc.Node {
        return this.node;
    }

    protected onDestroy(): void {
        this.ClearUIComponents();
    }

    protected ClearUIComponents(): void {
    }

    public Init(uiData: IUIData = null): void {
        this.mUIData = uiData;
        this.OnInit(uiData);
    }

    public Open(uiData: IUIData = null): void {
        this.State = PanelState.Opening;
        this.OnOpen(uiData);
    }

    public Show(): void {
        this.node.active = true;
        this.OnShow();
    }

    public Hide(): void {
        this.State = PanelState.Hide;
        this.node.active = false;
        this.OnHide();
    }

    protected OnInit(uiData: IUIData = null): void {
    }

    protected OnOpen(uiData: IUIData = null): void {
    }

    protected OnShow(): void {
    }

    protected OnHide(): void {
    }

    public Close(destroy: boolean = true): void {
        if (this.Info) {
            this.Info.UIData = this.mUIData;
        }
        if (this.mOnClosed) {
            this.mOnClosed();
            this.mOnClosed = null;
        }
        this.Hide();
        this.State = PanelState.Closed;
        this.OnClose();

        if (destroy && cc.isValid(this.node)) {
            this.node.destroy();
        }

        if (this.Loader) {
            this.Loader.Unload();
            UIKit.Config.PanelLoaderPool.RecycleLoader(this.Loader);
            this.Loader = null;
        }
        this.mUIData = null;
    }

    protected CloseSelf(): void {
        UIKit.ClosePanel(this);
    }

    protected Back(): void {
        UIKit.Back(this.node.name);
    }

    protected abstract OnClose(): void;

    public OnClosed(onPanelClosed: () => void): void {
        this.mOnClosed = onPanelClosed;
    }
}

// #endregion

// #region UIManager

/** Runtime-only Component — no @ccclass (Cocos: one Component per script file). */
class UIManager extends MonoSingleton {

    private static mInstance: UIManager = null;

    public static get Instance(): UIManager {
        if (!UIManager.mInstance || !cc.isValid(UIManager.mInstance.node)) {
            // ensure UIRoot exists first
            const root = UIRoot.Instance;
            let manager = root.node.getComponentInChildren(UIManager);
            if (!manager) {
                const node = new cc.Node("Manager");
                root.node.addChild(node);
                manager = node.addComponent(UIManager);
            }
            UIManager.mInstance = manager;
            manager.OnSingletonInit();
        }
        return UIManager.mInstance;
    }

    public OpenUIAsync(panelSearchKeys: PanelSearchKeys, onLoad: (panel: IPanel) => void): void {
        if (panelSearchKeys.OpenType === PanelOpenType.Single) {
            const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
            let retPanel = panels.length > 0 ? panels[0] : null;
            if (!retPanel) {
                this.CreateUIAsync(panelSearchKeys, (panel) => {
                    if (!panel) {
                        if (onLoad) {
                            onLoad(null);
                        }
                        return;
                    }
                    panel.Open(panelSearchKeys.UIData);
                    panel.Show();
                    if (onLoad) {
                        onLoad(panel);
                    }
                });
            } else {
                if (retPanel.Info && retPanel.Info.Level !== panelSearchKeys.Level) {
                    UIKit.Root.SetLevelOfPanel(panelSearchKeys.Level, retPanel);
                }
                retPanel.Open(panelSearchKeys.UIData);
                retPanel.Show();
                if (onLoad) {
                    onLoad(retPanel);
                }
            }
        } else {
            this.CreateUIAsync(panelSearchKeys, (panel) => {
                if (panel) {
                    panel.Open(panelSearchKeys.UIData);
                    panel.Show();
                }
                if (onLoad) {
                    onLoad(panel);
                }
            });
        }
    }

    public OpenUI(panelSearchKeys: PanelSearchKeys): IPanel {
        if (panelSearchKeys.OpenType === PanelOpenType.Single) {
            const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
            let retPanel = panels.length > 0 ? panels[0] : null;
            if (!retPanel) {
                retPanel = this.CreateUI(panelSearchKeys);
            }
            if (!retPanel) {
                return null;
            }
            if (retPanel.Info && retPanel.Info.Level !== panelSearchKeys.Level) {
                UIKit.Root.SetLevelOfPanel(panelSearchKeys.Level, retPanel);
            }
            retPanel.Open(panelSearchKeys.UIData);
            retPanel.Show();
            return retPanel;
        }
        const retPanel = this.CreateUI(panelSearchKeys);
        if (retPanel) {
            retPanel.Open(panelSearchKeys.UIData);
            retPanel.Show();
        }
        return retPanel;
    }

    public ShowUI(panelSearchKeys: PanelSearchKeys): void {
        const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
        if (panels.length > 0) {
            panels[0].Show();
        }
    }

    public HideUI(panelSearchKeys: PanelSearchKeys): void {
        const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
        if (panels.length > 0) {
            panels[0].Hide();
        }
    }

    public CloseAllUI(): void {
        const all = UIKit.Table.ToArray();
        for (let i = 0; i < all.length; i++) {
            const layer = all[i];
            layer.Close();
            if (layer.Info) {
                layer.Info.Recycle2Cache();
                layer.Info = null;
            }
        }
        UIKit.Table.Clear();
    }

    public HideAllUI(): void {
        const all = UIKit.Table.ToArray();
        for (let i = 0; i < all.length; i++) {
            all[i].Hide();
        }
    }

    public CloseUI(panelSearchKeys: PanelSearchKeys): void {
        const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
        const panel = panels.length > 0 ? panels[panels.length - 1] : null;
        if (panel) {
            panel.Close();
            UIKit.Table.Remove(panel);
            if (panel.Info) {
                panel.Info.Recycle2Cache();
                panel.Info = null;
            }
        }
    }

    public RemoveUI(panelSearchKeys: PanelSearchKeys): void {
        const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
        if (panels.length > 0) {
            UIKit.Table.Remove(panels[0]);
        }
    }

    public GetUI(panelSearchKeys: PanelSearchKeys): UIPanel {
        const panels = UIKit.Table.GetPanelsByPanelSearchKeys(panelSearchKeys);
        return panels.length > 0 ? (panels[0] as UIPanel) : null;
    }

    public CreateUI(panelSearchKeys: PanelSearchKeys): IPanel {
        const panel = UIKit.Config.LoadPanel(panelSearchKeys);
        if (!panel) {
            return null;
        }
        UIKit.Root.SetLevelOfPanel(panelSearchKeys.Level, panel);
        UIKit.Config.SetDefaultSizeOfPanel(panel);
        panel.Transform.name = panelSearchKeys.GameObjName
            || (panelSearchKeys.PanelType ? panelSearchKeys.PanelType.name : panel.Transform.name);
        panel.Info = PanelInfo.Allocate(
            panelSearchKeys.GameObjName,
            panelSearchKeys.Level,
            panelSearchKeys.UIData,
            panelSearchKeys.PanelType,
            panelSearchKeys.AssetBundleName
        );
        UIKit.Table.Add(panel);
        panel.Init(panelSearchKeys.UIData);
        return panel;
    }

    public CreateUIAsync(panelSearchKeys: PanelSearchKeys, onPanelCreate: (panel: IPanel) => void): void {
        UIKit.Config.LoadPanelAsync(panelSearchKeys, (panel) => {
            if (!panel) {
                onPanelCreate(null);
                return;
            }
            UIKit.Root.SetLevelOfPanel(panelSearchKeys.Level, panel);
            UIKit.Config.SetDefaultSizeOfPanel(panel);
            panel.Transform.name = panelSearchKeys.GameObjName
                || (panelSearchKeys.PanelType ? panelSearchKeys.PanelType.name : panel.Transform.name);
            panel.Info = PanelInfo.Allocate(
                panelSearchKeys.GameObjName,
                panelSearchKeys.Level,
                panelSearchKeys.UIData,
                panelSearchKeys.PanelType,
                panelSearchKeys.AssetBundleName
            );
            UIKit.Table.Add(panel);
            panel.Init(panelSearchKeys.UIData);
            onPanelCreate(panel);
        });
    }

    protected onDestroy(): void {
        if (UIManager.mInstance === this) {
            UIManager.mInstance = null;
        }
        UIKit.Table.Clear();
        super.onDestroy();
    }
}

// #endregion

// #region UIPanelStack

export class UIPanelStack {

    private readonly mUIStack: PanelInfo[] = [];

    public PushPanelType<T extends UIPanel>(panelType: PanelConstructor): void {
        this.Push(UIKit.GetPanel(panelType));
    }

    public Push(view: IPanel): void {
        if (view) {
            if (view.Info && !view.Info.GameObjName) {
                view.Info.GameObjName = view.Transform.name;
            }
            this.mUIStack.push(view.Info);
            view.Close();
            const panelSearchKeys = PanelSearchKeys.Allocate();
            panelSearchKeys.GameObjName = view.Transform.name;
            UIManager.Instance.RemoveUI(panelSearchKeys);
            panelSearchKeys.Recycle2Cache();
        }
    }

    public Pop(): void {
        if (this.mUIStack.length === 0) {
            return;
        }
        const previousPanelInfo = this.mUIStack.pop();
        const panelSearchKeys = PanelSearchKeys.Allocate();
        panelSearchKeys.GameObjName = previousPanelInfo.GameObjName;
        panelSearchKeys.Level = previousPanelInfo.Level;
        panelSearchKeys.UIData = previousPanelInfo.UIData;
        panelSearchKeys.AssetBundleName = previousPanelInfo.AssetBundleName;
        panelSearchKeys.PanelType = previousPanelInfo.PanelType;
        UIManager.Instance.OpenUI(panelSearchKeys);
        panelSearchKeys.Recycle2Cache();
    }
}

// #endregion

// #region UIKit

export class UIKit {

    public static Config: UIKitConfig = new UIKitConfig();
    public static readonly Table: UIPanelTable = new UIPanelTable();
    public static readonly Stack: UIPanelStack = new UIPanelStack();

    private static readonly sPanelPrefabMap: Map<Function, string> = new Map();

    /** 注册 Panel 类型对应的预制体路径（可选；默认用类名） */
    public static RegisterPanel(panelType: PanelConstructor, prefabName: string): void {
        UIKit.sPanelPrefabMap.set(panelType, prefabName);
    }

    public static GetRegisteredPrefabName(panelType: PanelConstructor): string {
        return UIKit.sPanelPrefabMap.get(panelType) || null;
    }

    /** 使用 ResKit 加载面板（替代 Unity SupportOldQF 自动初始化） */
    public static UseResKitLoader(): void {
        UIKit.Config.PanelLoaderPool = new ResKitPanelLoaderPool();
    }

    public static get Root(): UIRoot {
        return UIKit.Config.Root;
    }

    public static OpenPanel(
        panelType: PanelConstructor,
        canvasLevel: UILevel = UILevel.Common,
        uiData: IUIData = null,
        assetBundleName: string = null,
        prefabName: string = null,
        openType: PanelOpenType = PanelOpenType.Single
    ): UIPanel {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        panelSearchKeys.OpenType = openType;
        panelSearchKeys.Level = canvasLevel;
        panelSearchKeys.PanelType = panelType;
        panelSearchKeys.AssetBundleName = assetBundleName;
        panelSearchKeys.GameObjName = prefabName;
        panelSearchKeys.UIData = uiData;
        const retPanel = UIManager.Instance.OpenUI(panelSearchKeys) as UIPanel;
        panelSearchKeys.Recycle2Cache();
        return retPanel;
    }

    /** C# `OpenPanel<T>(IUIData, PanelOpenType, ...)` */
    public static OpenPanelWithData(
        panelType: PanelConstructor,
        uiData: IUIData,
        openType: PanelOpenType = PanelOpenType.Single,
        assetBundleName: string = null,
        prefabName: string = null
    ): UIPanel {
        return UIKit.OpenPanel(panelType, UILevel.Common, uiData, assetBundleName, prefabName, openType);
    }

    /** C# `OpenPanel<T>(PanelOpenType, UILevel, ...)` */
    public static OpenPanelWithOpenType(
        panelType: PanelConstructor,
        openType: PanelOpenType,
        canvasLevel: UILevel = UILevel.Common,
        uiData: IUIData = null,
        assetBundleName: string = null,
        prefabName: string = null
    ): UIPanel {
        return UIKit.OpenPanel(panelType, canvasLevel, uiData, assetBundleName, prefabName, openType);
    }

    public static OpenPanelByName(
        panelName: string,
        level: UILevel = UILevel.Common,
        assetBundleName: string = null
    ): UIPanel {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        panelSearchKeys.Level = level;
        panelSearchKeys.AssetBundleName = assetBundleName;
        panelSearchKeys.GameObjName = panelName;
        const retPanel = UIManager.Instance.OpenUI(panelSearchKeys) as UIPanel;
        panelSearchKeys.Recycle2Cache();
        return retPanel;
    }

    public static OpenPanelAsync(
        panelType: PanelConstructor,
        onLoaded: (panel: UIPanel) => void,
        canvasLevel: UILevel = UILevel.Common,
        uiData: IUIData = null,
        assetBundleName: string = null,
        prefabName: string = null
    ): void {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        panelSearchKeys.OpenType = PanelOpenType.Single;
        panelSearchKeys.Level = canvasLevel;
        panelSearchKeys.PanelType = panelType;
        panelSearchKeys.AssetBundleName = assetBundleName;
        panelSearchKeys.GameObjName = prefabName;
        panelSearchKeys.UIData = uiData;
        UIManager.Instance.OpenUIAsync(panelSearchKeys, (panel) => {
            panelSearchKeys.Recycle2Cache();
            if (onLoaded) {
                onLoaded(panel as UIPanel);
            }
        });
    }

    public static ClosePanel(panelTypeOrNameOrPanel: PanelConstructor | string | UIPanel): void {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        if (typeof panelTypeOrNameOrPanel === "string") {
            panelSearchKeys.GameObjName = panelTypeOrNameOrPanel;
        } else if (panelTypeOrNameOrPanel && (panelTypeOrNameOrPanel as UIPanel).Transform) {
            panelSearchKeys.Panel = panelTypeOrNameOrPanel as UIPanel;
        } else {
            panelSearchKeys.PanelType = panelTypeOrNameOrPanel as PanelConstructor;
        }
        UIManager.Instance.CloseUI(panelSearchKeys);
        panelSearchKeys.Recycle2Cache();
    }

    public static ShowPanel(panelTypeOrName: PanelConstructor | string): void {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        if (typeof panelTypeOrName === "string") {
            panelSearchKeys.GameObjName = panelTypeOrName;
        } else {
            panelSearchKeys.PanelType = panelTypeOrName;
        }
        UIManager.Instance.ShowUI(panelSearchKeys);
        panelSearchKeys.Recycle2Cache();
    }

    public static HidePanel(panelTypeOrName: PanelConstructor | string): void {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        if (typeof panelTypeOrName === "string") {
            panelSearchKeys.GameObjName = panelTypeOrName;
        } else {
            panelSearchKeys.PanelType = panelTypeOrName;
        }
        UIManager.Instance.HideUI(panelSearchKeys);
        panelSearchKeys.Recycle2Cache();
    }

    public static CloseAllPanel(): void {
        UIManager.Instance.CloseAllUI();
    }

    public static HideAllPanel(): void {
        UIManager.Instance.HideAllUI();
    }

    public static GetPanel(panelTypeOrName: PanelConstructor | string): UIPanel {
        const panelSearchKeys = PanelSearchKeys.Allocate();
        if (typeof panelTypeOrName === "string") {
            panelSearchKeys.GameObjName = panelTypeOrName;
        } else {
            panelSearchKeys.PanelType = panelTypeOrName;
        }
        const retPanel = UIManager.Instance.GetUI(panelSearchKeys);
        panelSearchKeys.Recycle2Cache();
        return retPanel;
    }

    public static Back(currentPanelNameOrPanel?: string | UIPanel | PanelConstructor): void {
        if (typeof currentPanelNameOrPanel === "string") {
            if (currentPanelNameOrPanel) {
                const panelSearchKeys = PanelSearchKeys.Allocate();
                panelSearchKeys.GameObjName = currentPanelNameOrPanel;
                UIManager.Instance.CloseUI(panelSearchKeys);
                panelSearchKeys.Recycle2Cache();
            }
        } else if (currentPanelNameOrPanel && (currentPanelNameOrPanel as UIPanel).Transform) {
            const panelSearchKeys = PanelSearchKeys.Allocate();
            panelSearchKeys.GameObjName = (currentPanelNameOrPanel as UIPanel).node.name;
            UIManager.Instance.CloseUI(panelSearchKeys);
            panelSearchKeys.Recycle2Cache();
        } else if (currentPanelNameOrPanel) {
            const panelSearchKeys = PanelSearchKeys.Allocate();
            panelSearchKeys.PanelType = currentPanelNameOrPanel as PanelConstructor;
            UIManager.Instance.CloseUI(panelSearchKeys);
            panelSearchKeys.Recycle2Cache();
        }
        UIKit.Stack.Pop();
    }
}

// #endregion

// Init pools eagerly
SafeObjectPool.Instance(PanelSearchKeys).Init(40, 10);
SafeObjectPool.Instance(PanelInfo).Init(40, 10);
