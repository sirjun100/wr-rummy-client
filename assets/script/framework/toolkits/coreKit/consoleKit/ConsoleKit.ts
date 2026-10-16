/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * ConsoleKit for Cocos Creator (TypeScript)
 * Registry + LogModule + optional cc.Node / DOM overlay (no Unity IMGUI)
 ****************************************************************************/


import * as cc from 'cc';
import { LogKit } from "../logKit/LogKit";

// #region ConsoleModule

export class ConsoleModule {

    public Title: string = "";
    public OnDrawGUI: () => void = null;

    public OnInit(): void {
    }

    public DrawGUI(): void {
        if (this.OnDrawGUI) {
            this.OnDrawGUI();
        }
    }

    public OnDestroy(): void {
    }
}

export function ConsoleModuleTitle<T extends ConsoleModule>(self: T, title: string): T {
    self.Title = title;
    return self;
}

export function ConsoleModuleOnGUI<T extends ConsoleModule>(self: T, onGUI: () => void): T {
    self.OnDrawGUI = onGUI;
    return self;
}

// #endregion

// #region LogModule

export enum ConsoleLogType {
    Log = 0,
    Warning = 1,
    Error = 2,
    Exception = 3,
}

export class ConsoleMessage {
    public readonly message: string;
    public readonly stackTrace: string;
    public readonly type: ConsoleLogType;

    public constructor(message: string, stackTrace: string, type: ConsoleLogType) {
        this.message = message;
        this.stackTrace = stackTrace;
        this.type = type;
    }
}

export class LogModule extends ConsoleModule {

    public Title: string = "Log";
    public Collapse: boolean = false;
    public ScrollToBottom: boolean = true;
    public MaxEntries: number = 500;

    private readonly entries: ConsoleMessage[] = [];
    private mOriginalLog: typeof console.log = null;
    private mOriginalWarn: typeof console.warn = null;
    private mOriginalError: typeof console.error = null;
    private mHooked: boolean = false;

    public get Entries(): ReadonlyArray<ConsoleMessage> {
        return this.entries;
    }

    public OnInit(): void {
        this.HookConsole();
    }

    public OnDestroy(): void {
        this.UnhookConsole();
    }

    public Clear(): void {
        this.entries.length = 0;
    }

    public GetDisplayEntries(): ConsoleMessage[] {
        if (!this.Collapse) {
            return this.entries.slice();
        }
        const result: ConsoleMessage[] = [];
        for (let i = 0; i < this.entries.length; i++) {
            if (i > 0 && this.entries[i].message === this.entries[i - 1].message) {
                continue;
            }
            result.push(this.entries[i]);
        }
        return result;
    }

    public DrawGUI(): void {
        if (this.OnDrawGUI) {
            this.OnDrawGUI();
            return;
        }
        // Headless / programmatic — data available via Entries
    }

    private HookConsole(): void {
        if (this.mHooked || typeof console === "undefined") {
            return;
        }
        this.mHooked = true;
        const self = this;
        this.mOriginalLog = console.log;
        this.mOriginalWarn = console.warn;
        this.mOriginalError = console.error;

        console.log = function (...args: any[]) {
            self.HandleLog(self.FormatArgs(args), "", ConsoleLogType.Log);
            self.mOriginalLog.apply(console, args);
        };
        console.warn = function (...args: any[]) {
            self.HandleLog(self.FormatArgs(args), "", ConsoleLogType.Warning);
            self.mOriginalWarn.apply(console, args);
        };
        console.error = function (...args: any[]) {
            self.HandleLog(self.FormatArgs(args), "", ConsoleLogType.Error);
            self.mOriginalError.apply(console, args);
        };
    }

    private UnhookConsole(): void {
        if (!this.mHooked) {
            return;
        }
        this.mHooked = false;
        if (this.mOriginalLog) {
            console.log = this.mOriginalLog;
        }
        if (this.mOriginalWarn) {
            console.warn = this.mOriginalWarn;
        }
        if (this.mOriginalError) {
            console.error = this.mOriginalError;
        }
    }

    private FormatArgs(args: any[]): string {
        const parts: string[] = [];
        for (let i = 0; i < args.length; i++) {
            const a = args[i];
            if (typeof a === "string") {
                parts.push(a);
            } else {
                try {
                    parts.push(JSON.stringify(a));
                } catch (e) {
                    parts.push(String(a));
                }
            }
        }
        return parts.join(" ");
    }

    public HandleLog(message: string, stackTrace: string, type: ConsoleLogType): void {
        this.entries.push(new ConsoleMessage(message, stackTrace, type));
        if (this.entries.length > this.MaxEntries) {
            this.entries.splice(0, this.entries.length - this.MaxEntries);
        }
    }
}

// #endregion

// #region ConsoleKit

export class ConsoleKit {

    private static mDefaultLogModule: LogModule = new LogModule();
    private static mModules: ConsoleModule[] = [ConsoleKit.mDefaultLogModule];
    private static mInited: boolean = false;

    public static get IsInited(): boolean {
        return ConsoleKit.mInited;
    }

    public static get Modules(): ReadonlyArray<ConsoleModule> {
        return ConsoleKit.mModules;
    }

    public static get DefaultLogModule(): LogModule {
        return ConsoleKit.mDefaultLogModule;
    }

    public static InitModules(): void {
        for (let i = 0; i < ConsoleKit.mModules.length; i++) {
            ConsoleKit.mModules[i].OnInit();
        }
        ConsoleKit.mInited = true;
        LogKit.I("[ConsoleKit] modules inited: {0}", ConsoleKit.mModules.length);
    }

    public static AddModule(module: ConsoleModule): void {
        ConsoleKit.mModules.push(module);
        if (ConsoleKit.mInited) {
            module.OnInit();
        }
    }

    public static DestroyModules(): void {
        for (let i = 0; i < ConsoleKit.mModules.length; i++) {
            ConsoleKit.mModules[i].OnDestroy();
        }
        const next: ConsoleModule[] = [];
        for (let i = 0; i < ConsoleKit.mModules.length; i++) {
            if (ConsoleKit.mModules[i] === ConsoleKit.mDefaultLogModule) {
                next.push(ConsoleKit.mModules[i]);
            }
        }
        ConsoleKit.mModules = next;
        ConsoleKit.mInited = false;
    }
}

// #endregion

// #region ConsoleWindow (Cocos overlay)

const { ccclass, property } = cc._decorator;

@ccclass
export class ConsoleWindow extends cc.Component {

    @property
    public Visible: boolean = false;

    @property
    public ToggleKeyCode: number = cc.KeyCode.F1;

    private mRoot: cc.Node = null;
    private mLabel: cc.Label = null;
    private mSelectedIndex: number = 0;

    protected onLoad(): void {
        if (!ConsoleKit.IsInited) {
            ConsoleKit.InitModules();
        }
        this.BuildUI();
        this.UpdateVisibility();
    }

    protected update(): void {
        if (!this.Visible) {
            return;
        }
        this.RefreshContent();
    }

    protected onDestroy(): void {
        cc.input.off(cc.Input.EventType.KEY_DOWN, this.OnKeyDown, this);
    }

    public Toggle(): void {
        this.Visible = !this.Visible;
        this.UpdateVisibility();
    }

    public Show(): void {
        this.Visible = true;
        this.UpdateVisibility();
    }

    public Hide(): void {
        this.Visible = false;
        this.UpdateVisibility();
    }

    private BuildUI(): void {
        this.mRoot = new cc.Node("ConsoleOverlay");
        this.node.addChild(this.mRoot);
        const winSize = cc.view.getVisibleSize();
        const rootUI = this.mRoot.addComponent(cc.UITransform);
        rootUI.setContentSize(winSize.width * 0.9, winSize.height * 0.4);
        this.mRoot.setPosition(0, -winSize.height * 0.25);

        const bg = this.mRoot.addComponent(cc.Graphics);
        bg.fillColor = new cc.Color(0, 0, 0, 180);
        bg.rect(-rootUI.width / 2, -rootUI.height / 2, rootUI.width, rootUI.height);
        bg.fill();

        const labelNode = new cc.Node("Content");
        this.mRoot.addChild(labelNode);
        this.mLabel = labelNode.addComponent(cc.Label);
        this.mLabel.fontSize = 14;
        this.mLabel.lineHeight = 18;
        this.mLabel.overflow = cc.Label.Overflow.RESIZE_HEIGHT;
        this.mLabel.horizontalAlign = cc.Label.HorizontalAlign.LEFT;
        this.mLabel.verticalAlign = cc.Label.VerticalAlign.TOP;
        let labelUI = labelNode.getComponent(cc.UITransform);
        if (!labelUI) {
            labelUI = labelNode.addComponent(cc.UITransform);
        }
        labelUI.setContentSize(rootUI.width - 20, rootUI.height - 20);
        labelUI.setAnchorPoint(0.5, 0.5);

        cc.input.on(cc.Input.EventType.KEY_DOWN, this.OnKeyDown, this);
    }

    private OnKeyDown(event: cc.EventKeyboard): void {
        if (event.keyCode === this.ToggleKeyCode) {
            this.Toggle();
        }
    }

    private UpdateVisibility(): void {
        if (this.mRoot) {
            this.mRoot.active = this.Visible;
        }
        if (this.Visible) {
            this.RefreshContent();
        }
    }

    private RefreshContent(): void {
        if (!this.mLabel) {
            return;
        }
        const modules = ConsoleKit.Modules;
        if (modules.length === 0) {
            this.mLabel.string = "[ConsoleKit] no modules";
            return;
        }
        if (this.mSelectedIndex >= modules.length) {
            this.mSelectedIndex = 0;
        }
        const module = modules[this.mSelectedIndex];
        module.DrawGUI();

        let text = "[ConsoleKit] " + module.Title + "\n";
        if (module instanceof LogModule) {
            const entries = module.GetDisplayEntries();
            const start = Math.max(0, entries.length - 40);
            for (let i = start; i < entries.length; i++) {
                const e = entries[i];
                const prefix = e.type === ConsoleLogType.Error || e.type === ConsoleLogType.Exception
                    ? "[E] "
                    : (e.type === ConsoleLogType.Warning ? "[W] " : "[I] ");
                text += prefix + e.message + "\n";
            }
        }
        this.mLabel.string = text;
    }

    public SelectModule(index: number): void {
        this.mSelectedIndex = index;
        this.RefreshContent();
    }

    public ClearLog(): void {
        ConsoleKit.DefaultLogModule.Clear();
        this.RefreshContent();
    }
}

// #endregion
