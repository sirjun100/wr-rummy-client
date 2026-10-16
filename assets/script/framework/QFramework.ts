/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * QFramework for Cocos Creator (TypeScript)
 *
 * https://qframework.cn
 * https://github.com/liangxiegame/QFramework
 *
 * Ported from QFramework.cs for Cocos Creator
 ****************************************************************************/


import * as cc from 'cc';
// #region Types


export interface TypeToken<T = unknown> extends Function {
    readonly prototype: T;
}

export interface Constructor<T = unknown> {
    new(...args: any[]): T;
}

interface EventClass<T = unknown> extends Constructor<T> {
}

function registerWithPrototypeChain<T>(container: IOCContainer, instance: T): void {
    let ctor: Function = (instance as object).constructor;
    const visited = new Set<Function>();

    while (ctor && ctor !== Object && !visited.has(ctor)) {
        visited.add(ctor);
        container.Register(ctor, instance);
        const proto = Object.getPrototypeOf(ctor.prototype);
        ctor = proto ? proto.constructor : null;
    }
}

function resolveTypeToken<T>(token?: TypeToken<T>): TypeToken<T> {
    if (token) {
        return token;
    }
    throw new Error(
        "TypeScript cannot preserve generic type at runtime. " +
        "Use GetModel(IGameModel) / GetSystem(ISystem) / GetUtility(IUtility), " +
        "or pass the abstract class token explicitly."
    );
}

function resolveRegisterEventArgs<T>(
    eventClassOrHandler: EventClass<T> | ((e: T) => void),
    onEventOrTarget?: ((e: T) => void) | object,
    target: object = null
): { eventClass: EventClass<T>; onEvent: (e: T) => void; target: object } {
    // JS 中 class 也是 function，不能用 typeof 区分事件类与回调；以第二个参数是否为回调判断
    if (typeof onEventOrTarget === "function") {
        return {
            eventClass: eventClassOrHandler as EventClass<T>,
            onEvent: onEventOrTarget as (e: T) => void,
            target: target
        };
    }
    throw new Error(
        "RegisterEvent requires an event class. Use RegisterEvent(GameStartEvent, onEvent, this) " +
        "like C# RegisterEvent<GameStartEvent>(onEvent)."
    );
}

// #endregion

// #region Delegate

class Delegate<T> {

    private list: Wrapper<T>[] = [];

    public addListener(callback: (val: T) => void, target: object): void {
        for (let i = 0; i < this.list.length; i++) {
            const element = this.list[i];
            if (element && element.fun === callback && element.target === target) {
                return;
            }
        }
        this.list.push({ target, fun: callback });
    }

    public invoke(val: T): void {
        const snapshot = this.list.slice();
        for (let i = 0; i < snapshot.length; i++) {
            const w = snapshot[i];
            if (!w) {
                continue;
            }
            w.fun.call(w.target, val);
        }
    }

    public removeListener(callback: (val: T) => void, target: object): void {
        for (let i = 0; i < this.list.length; i++) {
            const element = this.list[i];
            if (element && element.fun === callback && element.target === target) {
                this.list.splice(i, 1);
                return;
            }
        }
    }
}

interface Wrapper<T> {
    target: object;
    fun: (val: T) => void;
}

// #endregion

// #region UnRegister

export interface IUnRegister {
    UnRegister(): void;
    UnRegisterWhenGameObjectDestroyed(node: cc.Node): void;
    UnRegisterWhenDisabled(node: cc.Node): void;
    UnRegisterWhenCurrentSceneUnloaded(): void;
}

export interface IUnRegisterList {
    UnregisterList: IUnRegister[];
}

class CustomUnRegister implements IUnRegister {

    private mOnUnRegister: () => void = null;

    public constructor(onUnRegister: () => void) {
        this.mOnUnRegister = onUnRegister;
    }

    public UnRegister(): void {
        if (this.mOnUnRegister) {
            this.mOnUnRegister();
        }
        this.mOnUnRegister = null;
    }

    public UnRegisterWhenGameObjectDestroyed(node: cc.Node): void {
        UnRegisterExtension.AttachToNodeDestroyed(this, node);
    }

    public UnRegisterWhenDisabled(node: cc.Node): void {
        UnRegisterExtension.AttachToNodeDisabled(this, node);
    }

    public UnRegisterWhenCurrentSceneUnloaded(): void {
        UnRegisterExtension.AttachToCurrentSceneUnloaded(this);
    }
}

abstract class UnRegisterTrigger extends cc.Component {

    private readonly mUnRegisters: Set<IUnRegister> = new Set();

    public AddUnRegister(unRegister: IUnRegister): IUnRegister {
        this.mUnRegisters.add(unRegister);
        return unRegister;
    }

    protected UnRegisterAll(): void {
        this.mUnRegisters.forEach(unRegister => unRegister.UnRegister());
        this.mUnRegisters.clear();
    }
}

class UnRegisterDestroyTrigger extends UnRegisterTrigger {

    protected onDestroy(): void {
        this.UnRegisterAll();
    }
}

class UnRegisterOnDisableTrigger extends UnRegisterTrigger {

    protected onDisable(): void {
        this.UnRegisterAll();
    }
}

class UnRegisterCurrentSceneUnloadedTrigger extends UnRegisterTrigger {

    private static mDefault: UnRegisterCurrentSceneUnloadedTrigger = null;

    public static get Get(): UnRegisterCurrentSceneUnloadedTrigger {
        if (!this.mDefault || !cc.isValid(this.mDefault.node)) {
            const node = new cc.Node("UnRegisterCurrentSceneUnloadedTrigger");
            cc.game.addPersistRootNode(node);
            this.mDefault = node.addComponent(UnRegisterCurrentSceneUnloadedTrigger);
        }
        return this.mDefault;
    }

    protected onLoad(): void {
        cc.director.on(cc.Director.EVENT_BEFORE_SCENE_LOADING, this.onSceneUnloaded, this);
    }

    protected onDestroy(): void {
        cc.director.off(cc.Director.EVENT_BEFORE_SCENE_LOADING, this.onSceneUnloaded, this);
        if (UnRegisterCurrentSceneUnloadedTrigger.mDefault === this) {
            UnRegisterCurrentSceneUnloadedTrigger.mDefault = null;
        }
    }

    private onSceneUnloaded(): void {
        this.UnRegisterAll();
    }
}

class UnRegisterExtension {

    private static GetOrAddComponent<T extends cc.Component>(node: cc.Node, type: Constructor<T>): T {
        let trigger = node.getComponent(type);
        if (!trigger) {
            trigger = node.addComponent(type);
        }
        return trigger;
    }

    public static AttachToNodeDestroyed(unRegister: IUnRegister, node: cc.Node): void {
        this.GetOrAddComponent(node, UnRegisterDestroyTrigger).AddUnRegister(unRegister);
    }

    public static AttachToNodeDisabled(unRegister: IUnRegister, node: cc.Node): void {
        this.GetOrAddComponent(node, UnRegisterOnDisableTrigger).AddUnRegister(unRegister);
    }

    public static AttachToCurrentSceneUnloaded(unRegister: IUnRegister): void {
        UnRegisterCurrentSceneUnloadedTrigger.Get.AddUnRegister(unRegister);
    }
}

export function AddToUnregisterList(unRegister: IUnRegister, list: IUnRegisterList): IUnRegister {
    list.UnregisterList.push(unRegister);
    return unRegister;
}

export function UnRegisterAll(list: IUnRegisterList): void {
    list.UnregisterList.forEach(unRegister => unRegister.UnRegister());
    list.UnregisterList.length = 0;
}

// #endregion

// #region EasyEvent

export interface IEasyEvent {
    Register(onEvent: () => void, target?: object): IUnRegister;
}

export class EasyEvent implements IEasyEvent {

    private mOnEvent: Delegate<void> = new Delegate();

    public Register(onEvent: () => void, target: object = null): IUnRegister {
        this.mOnEvent.addListener(onEvent, target);
        return new CustomUnRegister(() => this.UnRegister(onEvent, target));
    }

    public RegisterWithACall(onEvent: () => void, target: object = null): IUnRegister {
        onEvent.call(target);
        return this.Register(onEvent, target);
    }

    public UnRegister(onEvent: () => void, target: object = null): void {
        this.mOnEvent.removeListener(onEvent, target);
    }

    public Trigger(): void {
        this.mOnEvent.invoke(undefined);
    }
}

/** C# `EasyEvent<T>` equivalent (TS cannot overload generic/non-generic class names). */
export class EasyEvent1<T> implements IEasyEvent {

    private mOnEvent: Delegate<T> = new Delegate();

    public Register(onEvent: () => void, target: object = null): IUnRegister {
        return this.RegisterWithArg(() => onEvent(), target);
    }

    public RegisterWithArg(onEvent: (e: T) => void, target: object = null): IUnRegister {
        this.mOnEvent.addListener(onEvent, target);
        return new CustomUnRegister(() => this.UnRegisterWithArg(onEvent, target));
    }

    public RegisterWithInitValue(onEvent: (e: T) => void, target: object, initValue: T): IUnRegister {
        onEvent.call(target, initValue);
        return this.RegisterWithArg(onEvent, target);
    }

    public UnRegisterWithArg(onEvent: (e: T) => void, target: object = null): void {
        this.mOnEvent.removeListener(onEvent, target);
    }

    public Trigger(e: T): void {
        this.mOnEvent.invoke(e);
    }
}

export class EasyEvent2<T, K> implements IEasyEvent {

    private mOnEvent: Delegate<{ t: T, k: K }> = new Delegate();

    public Register(onEvent: () => void, target: object = null): IUnRegister {
        return this.RegisterWithArg(() => onEvent(), target);
    }

    public RegisterWithArg(onEvent: (t: T, k: K) => void, target: object = null): IUnRegister {
        const wrapper = (payload: { t: T, k: K }) => onEvent.call(target, payload.t, payload.k);
        this.mOnEvent.addListener(wrapper, target);
        return new CustomUnRegister(() => this.mOnEvent.removeListener(wrapper, target));
    }

    public UnRegisterWithArg(onEvent: (t: T, k: K) => void, target: object = null): void {
        // kept for API parity; use CustomUnRegister from RegisterWithArg
    }

    public Trigger(t: T, k: K): void {
        this.mOnEvent.invoke({ t, k });
    }
}

export class EasyEvent3<T, K, S> implements IEasyEvent {

    private mOnEvent: Delegate<{ t: T, k: K, s: S }> = new Delegate();

    public Register(onEvent: () => void, target: object = null): IUnRegister {
        return this.RegisterWithArg(() => onEvent(), target);
    }

    public RegisterWithArg(onEvent: (t: T, k: K, s: S) => void, target: object = null): IUnRegister {
        const wrapper = (payload: { t: T, k: K, s: S }) => onEvent.call(target, payload.t, payload.k, payload.s);
        this.mOnEvent.addListener(wrapper, target);
        return new CustomUnRegister(() => this.mOnEvent.removeListener(wrapper, target));
    }

    public Trigger(t: T, k: K, s: S): void {
        this.mOnEvent.invoke({ t, k, s });
    }
}

export class EasyEvents {

    private readonly mTypeEvents: Map<Function, IEasyEvent> = new Map();

    public AddEvent<T extends IEasyEvent>(eventType: Constructor<T>, eventInstance: T): void {
        this.mTypeEvents.set(eventType, eventInstance);
    }

    public GetEvent<T extends IEasyEvent>(eventType: Constructor<T>): T {
        return this.mTypeEvents.get(eventType) as T;
    }

    public GetOrAddEvent<T extends IEasyEvent>(eventType: Constructor<T>, factory: () => T): T {
        if (!this.mTypeEvents.has(eventType)) {
            this.mTypeEvents.set(eventType, factory());
        }
        return this.mTypeEvents.get(eventType) as T;
    }
}

export class OrEvent implements IUnRegisterList {

    public UnregisterList: IUnRegister[] = [];

    private mOnEvent: Delegate<void> = new Delegate();

    public Or(easyEvent: IEasyEvent): OrEvent {
        AddToUnregisterList(easyEvent.Register(this.Trigger, this), this);
        return this;
    }

    public Register(onEvent: () => void, target: object = null): IUnRegister {
        this.mOnEvent.addListener(onEvent, target);
        return new CustomUnRegister(() => this.UnRegister(onEvent, target));
    }

    public RegisterWithACall(onEvent: () => void, target: object = null): IUnRegister {
        onEvent.call(target);
        return this.Register(onEvent, target);
    }

    public UnRegister(onEvent: () => void, target: object = null): void {
        this.mOnEvent.removeListener(onEvent, target);
        UnRegisterAll(this);
    }

    private Trigger(): void {
        this.mOnEvent.invoke(undefined);
    }
}

export function Or(first: IEasyEvent, second: IEasyEvent): OrEvent {
    return new OrEvent().Or(first).Or(second);
}

/** C# `OrEventExtensions.Or(this IEasyEvent, IEasyEvent)` equivalent. */
export namespace OrEventExtensions {
    export function Or(self: IEasyEvent, e: IEasyEvent): OrEvent {
        return new OrEvent().Or(self).Or(e);
    }
}

// #endregion

// #region TypeEventSystem

export class TypeEventSystem {

    public static readonly Global: TypeEventSystem = new TypeEventSystem();

    private readonly mEvents: Map<EventClass, EasyEvent1<any>> = new Map();

    public Send<T>(eventClass: EventClass<T>): void {
        this.SendWithData(eventClass, new eventClass());
    }

    public SendWithData<T>(eventClass: EventClass<T>, e: T): void {
        this.GetOrAddEvent<T>(eventClass).Trigger(e);
    }

    public Register<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target: object = null): IUnRegister {
        return this.GetOrAddEvent<T>(eventClass).RegisterWithArg(onEvent, target);
    }

    public UnRegister<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target: object = null): void {
        const evt = this.mEvents.get(eventClass);
        if (evt) {
            evt.UnRegisterWithArg(onEvent, target);
        }
    }

    private GetOrAddEvent<T>(eventClass: EventClass<T>): EasyEvent1<T> {
        if (!this.mEvents.has(eventClass)) {
            this.mEvents.set(eventClass, new EasyEvent1<T>());
        }
        return this.mEvents.get(eventClass) as EasyEvent1<T>;
    }

    public Clear(): void {
        this.mEvents.clear();
    }
}

// #endregion

// #region IOC

class IOCContainer {

    private readonly mInstances: Map<Function, unknown> = new Map();

    public Register<T>(key: Function, instance: T): void {
        this.mInstances.set(key, instance);
    }

    public Get<T>(type: TypeToken<T>): T {
        if (!this.mInstances.has(type)) {
            console.error(`IOCContainer: instance not found for ${type.name}`);
            return null;
        }
        return this.mInstances.get(type) as T;
    }

    public GetInstancesByType<T>(typeGuard: (instance: unknown) => instance is T): T[] {
        const results: T[] = [];
        this.mInstances.forEach(instance => {
            if (typeGuard(instance)) {
                results.push(instance);
            }
        });
        return results;
    }

    public Clear(): void {
        this.mInstances.clear();
    }
}

// #endregion

// #region BindableProperty

class BindablePropertyComparerAutoRegister {

    public static AutoRegister(): void {
        if (typeof cc === "undefined") {
            return;
        }

        BindableProperty.RegisterComparer(cc.Vec2, (a, b) => !!a && !!b && a.equals(b));
        BindableProperty.RegisterComparer(cc.Vec3, (a, b) => !!a && !!b && a.equals(b));
        BindableProperty.RegisterComparer(cc.Vec4, (a, b) => !!a && !!b && a.equals(b));
        BindableProperty.RegisterComparer(cc.Color, (a, b) => !!a && !!b && a.equals(b));
        BindableProperty.RegisterComparer(cc.Size, (a, b) => !!a && !!b && a.equals(b));
        BindableProperty.RegisterComparer(cc.Rect, (a, b) => !!a && !!b && a.equals(b));
        BindableProperty.RegisterComparer(cc.Quat, (a, b) => !!a && !!b && a.equals(b));
    }
}

export class BindableProperty<T> {

    public static Comparer: <TValue>(a: TValue, b: TValue) => boolean = (a, b) => a === b;

    private static readonly mComparers: Map<Function, (a: unknown, b: unknown) => boolean> = new Map();

    public static RegisterComparer<T>(type: Constructor<T>, comparer: (a: T, b: T) => boolean): void {
        BindableProperty.mComparers.set(type, comparer as (a: unknown, b: unknown) => boolean);
    }

    protected mValue: T;

    /** Instance comparer; C# sets static `BindableProperty<T>.Comparer` — use `RegisterComparer` for type-wide. */
    public Comparer: (a: T, b: T) => boolean = null;

    private mOnValueChanged: EasyEvent1<T> = new EasyEvent1<T>();

    public constructor(defaultValue: T = null) {
        this.mValue = defaultValue;
    }

    public WithComparer(comparer: (a: T, b: T) => boolean): BindableProperty<T> {
        this.Comparer = comparer;
        return this;
    }

    private GetComparer(): (a: T, b: T) => boolean {
        if (this.Comparer) {
            return this.Comparer;
        }
        const value = this.mValue as object;
        const typeComparer = value
            ? BindableProperty.mComparers.get(value.constructor)
            : null;
        if (typeComparer) {
            return typeComparer as (a: T, b: T) => boolean;
        }
        return BindableProperty.Comparer;
    }

    public get Value(): T {
        return this.mValue;
    }

    public set Value(v: T) {
        this.value = v;
    }

    public get value(): T {
        return this.mValue;
    }

    public set value(v: T) {
        const comparer = this.GetComparer();
        if (v === null && this.mValue === null) {
            return;
        }
        if (v !== null && comparer(v, this.mValue)) {
            return;
        }
        this.mValue = v;
        this.mOnValueChanged.Trigger(this.mValue);
    }

    public SetValueWithoutEvent(newValue: T): void {
        this.mValue = newValue;
    }

    public Register(onValueChanged: (v: T) => void, target: object = null): IUnRegister {
        return this.mOnValueChanged.RegisterWithArg(onValueChanged, target);
    }

    public RegisterOnValueChanged(onValueChanged: (v: T) => void, target: object = null): IUnRegister {
        return this.Register(onValueChanged, target);
    }

    public RegisterWithInitValue(onValueChanged: (v: T) => void, target: object = null): IUnRegister {
        return this.mOnValueChanged.RegisterWithInitValue(onValueChanged, target, this.mValue);
    }

    public UnRegister(onValueChanged: (v: T) => void, target: object = null): void {
        this.mOnValueChanged.UnRegisterWithArg(onValueChanged, target);
    }

    public UnRegisterOnValueChanged(onValueChanged: (v: T) => void, target: object): void {
        this.UnRegister(onValueChanged, target);
    }

    public toString(): string {
        return `${this.mValue}`;
    }
}

BindablePropertyComparerAutoRegister.AutoRegister();

// #endregion

// #region Rule

export interface IBelongToArchitecture {
    GetArchitecture(): IArchitecture;
}

export interface ICanSetArchitecture {
    SetArchitecture(architecture: IArchitecture): void;
}

export interface ICanGetModel {
    GetModel<T extends IModel>(token?: TypeToken<T>): T;
}

export interface ICanGetSystem {
    GetSystem<T extends ISystem>(token?: TypeToken<T>): T;
}

export interface ICanGetUtility {
    GetUtility<T extends IUtility>(token?: TypeToken<T>): T;
}

export interface ICanSendCommand {
    SendCommand<T extends ICommand>(command?: T): void;
    SendCommand<T extends ICommand>(commandType: Constructor<T>): void;
    SendCommand<TResult>(command: ICommandWithResult<TResult>): TResult;
}

export interface ICanSendEvent {
    SendEvent<T>(eventClass?: EventClass<T>): void;
    SendEvent<T>(e: T): void;
}

export interface ICanRegisterEvent {
    RegisterEvent<T>(onEvent: (e: T) => void, target?: object): IUnRegister;
    RegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): IUnRegister;
    UnRegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): void;
}

export interface ICanSendQuery {
    SendQuery<TResult>(query: IQuery<TResult>): TResult;
}

export interface ICanInit {
    Initialized: boolean;
    Init(): void;
    Deinit(): void;
}

// #endregion

// #region Architecture

export interface IArchitecture {

    RegisterModel<T extends IModel>(model: T): void;
    RegisterSystem<T extends ISystem>(system: T): void;
    RegisterUtility<T extends IUtility>(utility: T): void;

    GetModel<T extends IModel>(token?: TypeToken<T>): T;
    GetSystem<T extends ISystem>(token?: TypeToken<T>): T;
    GetUtility<T extends IUtility>(token?: TypeToken<T>): T;

    SendCommand<T extends ICommand>(command?: T): void;
    SendCommand<T extends ICommand>(commandType: Constructor<T>): void;
    SendCommand<TResult>(command: ICommandWithResult<TResult>): TResult;
    SendQuery<TResult>(query: IQuery<TResult>): TResult;

    SendEvent<T>(eventClass?: EventClass<T>): void;
    SendEvent<T>(e: T): void;

    RegisterEvent<T>(onEvent: (e: T) => void, target?: object): IUnRegister;
    RegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): IUnRegister;
    UnRegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): void;

    Deinit(): void;
}

export class Architecture<T> implements IArchitecture {

    private static readonly mArchitectureMap: Map<Function, IArchitecture> = new Map();

    public static OnRegisterPatch: (architecture: IArchitecture) => void = () => { };

    public static get Interface(): IArchitecture {
        return this.InitArchitecture();
    }

    public static InitArchitecture(): IArchitecture {
        if (!Architecture.mArchitectureMap.has(this)) {
            const architecture: IArchitecture = new (this as any)();
            const arch = architecture as Architecture<unknown>;
            arch.mContainer = new IOCContainer();
            arch.mTypeEventSystem = new TypeEventSystem();
            arch.Init();

            Architecture.OnRegisterPatch(architecture);

            arch.mContainer.GetInstancesByType(isModel).forEach(model => {
                if (!model.Initialized) {
                    model.Init();
                    model.Initialized = true;
                }
            });

            arch.mContainer.GetInstancesByType(isSystem).forEach(system => {
                if (!system.Initialized) {
                    system.Init();
                    system.Initialized = true;
                }
            });

            arch.mInited = true;
            Architecture.mArchitectureMap.set(this, architecture);
        }

        return Architecture.mArchitectureMap.get(this)!;
    }

    private mContainer: IOCContainer = new IOCContainer();
    private mTypeEventSystem: TypeEventSystem = new TypeEventSystem();
    private mInited: boolean = false;

    protected Init(): void { }

    protected OnDeinit(): void { }

    public Deinit(): void {
        this.OnDeinit();

        this.mContainer.GetInstancesByType(isSystem).forEach(system => {
            if (system.Initialized) {
                system.Deinit();
                system.Initialized = false;
            }
        });

        this.mContainer.GetInstancesByType(isModel).forEach(model => {
            if (model.Initialized) {
                model.Deinit();
                model.Initialized = false;
            }
        });

        this.mTypeEventSystem.Clear();
        this.mContainer.Clear();
        this.mInited = false;
        Architecture.mArchitectureMap.delete(this.constructor as Function);
    }

    public RegisterModel<T extends IModel>(model: T): void {
        model.SetArchitecture(this);
        registerWithPrototypeChain(this.mContainer, model);

        if (this.mInited && !model.Initialized) {
            model.Init();
            model.Initialized = true;
        }
    }

    public RegisterSystem<T extends ISystem>(system: T): void {
        system.SetArchitecture(this);
        registerWithPrototypeChain(this.mContainer, system);

        if (this.mInited && !system.Initialized) {
            system.Init();
            system.Initialized = true;
        }
    }

    public RegisterUtility<T extends IUtility>(utility: T): void {
        registerWithPrototypeChain(this.mContainer, utility);
    }

    public GetSystem<T extends ISystem>(token?: TypeToken<T>): T {
        return this.mContainer.Get(resolveTypeToken(token));
    }

    public GetUtility<T extends IUtility>(token?: TypeToken<T>): T {
        return this.mContainer.Get(resolveTypeToken(token));
    }

    public GetModel<T extends IModel>(token?: TypeToken<T>): T {
        return this.mContainer.Get(resolveTypeToken(token));
    }

    public SendCommand<T extends ICommand>(command: T): void;
    public SendCommand<T extends ICommand>(commandType: Constructor<T>): void;
    public SendCommand<TResult>(command: ICommandWithResult<TResult>): TResult;
    public SendCommand(commandOrType: ICommand | Constructor<ICommand>): any {
        if (typeof commandOrType === "function") {
            this.ExecuteCommand(new commandOrType());
            return;
        }

        commandOrType.SetArchitecture(this);
        return commandOrType.Execute();
    }

    protected ExecuteCommand(command: ICommand): void {
        command.SetArchitecture(this);
        command.Execute();
    }

    protected ExecuteCommandWithResult<TResult>(command: ICommandWithResult<TResult>): TResult {
        command.SetArchitecture(this);
        return command.Execute();
    }

    public SendQuery<TResult>(query: IQuery<TResult>): TResult {
        query.SetArchitecture(this);
        return query.Do();
    }

    public SendEvent<T>(eventClass?: EventClass<T>): void;
    public SendEvent<T>(e: T): void;
    public SendEvent<T>(eventClassOrInstance?: EventClass<T> | T): void {
        if (eventClassOrInstance === undefined) {
            throw new Error("SendEvent requires an event class or event instance.");
        }
        if (typeof eventClassOrInstance === "function") {
            this.mTypeEventSystem.Send(eventClassOrInstance as EventClass<T>);
            return;
        }

        const e = eventClassOrInstance as T & { constructor: EventClass<T> };
        this.mTypeEventSystem.SendWithData(e.constructor, e);
    }

    public RegisterEvent<T>(onEvent: (e: T) => void, target?: object): IUnRegister;
    public RegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): IUnRegister;
    public RegisterEvent<T>(eventClassOrHandler: EventClass<T> | ((e: T) => void), onEventOrTarget?: ((e: T) => void) | object, target: object = null): IUnRegister {
        const args = resolveRegisterEventArgs(eventClassOrHandler, onEventOrTarget, target);
        return this.mTypeEventSystem.Register(args.eventClass, args.onEvent, args.target);
    }

    public UnRegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target: object = null): void {
        this.mTypeEventSystem.UnRegister(eventClass, onEvent, target);
    }
}

function isModel(instance: unknown): instance is IModel {
    return instance instanceof AbstractModel;
}

function isSystem(instance: unknown): instance is ISystem {
    return instance instanceof AbstractSystem;
}

// #endregion

// #region ArchitectureMember

abstract class ArchitectureMember implements ICanSetArchitecture, IBelongToArchitecture,
    ICanGetModel, ICanGetSystem, ICanGetUtility, ICanSendEvent, ICanSendCommand, ICanSendQuery, ICanRegisterEvent {

    private mArchitecture: IArchitecture = null;

    public SetArchitecture(architecture: IArchitecture): void {
        this.mArchitecture = architecture;
    }

    public GetArchitecture(): IArchitecture {
        return this.mArchitecture;
    }

    public GetModel<T extends IModel>(token?: TypeToken<T>): T {
        return this.mArchitecture.GetModel(token);
    }

    public GetSystem<T extends ISystem>(token?: TypeToken<T>): T {
        return this.mArchitecture.GetSystem(token);
    }

    public GetUtility<T extends IUtility>(token?: TypeToken<T>): T {
        return this.mArchitecture.GetUtility(token);
    }

    public SendEvent<T>(eventClass?: EventClass<T>): void;
    public SendEvent<T>(e: T): void;
    public SendEvent<T>(eventClassOrInstance?: EventClass<T> | T): void {
        if (eventClassOrInstance === undefined) {
            throw new Error("SendEvent requires an event class or event instance.");
        }
        if (typeof eventClassOrInstance === "function") {
            this.mArchitecture.SendEvent(eventClassOrInstance as EventClass<T>);
            return;
        }
        this.mArchitecture.SendEvent(eventClassOrInstance as T);
    }

    public SendCommand<T extends ICommand>(command: T): void;
    public SendCommand<T extends ICommand>(commandType: Constructor<T>): void;
    public SendCommand<TResult>(command: ICommandWithResult<TResult>): TResult;
    public SendCommand(commandOrType: ICommand | Constructor<ICommand>): any {
        return this.mArchitecture.SendCommand(commandOrType as any);
    }

    public SendQuery<TResult>(query: IQuery<TResult>): TResult {
        return this.mArchitecture.SendQuery(query);
    }

    public RegisterEvent<T>(onEvent: (e: T) => void, target?: object): IUnRegister;
    public RegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): IUnRegister;
    public RegisterEvent<T>(eventClassOrHandler: EventClass<T> | ((e: T) => void), onEventOrTarget?: ((e: T) => void) | object, target: object = null): IUnRegister {
        const args = resolveRegisterEventArgs(eventClassOrHandler, onEventOrTarget, target);
        return this.mArchitecture.RegisterEvent(args.eventClass, args.onEvent, args.target);
    }

    public UnRegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target: object = null): void {
        this.mArchitecture.UnRegisterEvent(eventClass, onEvent, target);
    }
}

// #endregion

// #region Controller

export interface IController extends
    IBelongToArchitecture, ICanSendCommand, ICanGetSystem, ICanGetModel,
    ICanRegisterEvent, ICanSendQuery, ICanGetUtility {
}

export abstract class AbstractController extends cc.Component implements IController {

    public GetModel<T extends IModel>(token?: TypeToken<T>): T {
        return this.GetArchitecture().GetModel(token);
    }

    public GetSystem<T extends ISystem>(token?: TypeToken<T>): T {
        return this.GetArchitecture().GetSystem(token);
    }

    public GetUtility<T extends IUtility>(token?: TypeToken<T>): T {
        return this.GetArchitecture().GetUtility(token);
    }

    public SendCommand<T extends ICommand>(command: T): void;
    public SendCommand<T extends ICommand>(commandType: Constructor<T>): void;
    public SendCommand<TResult>(command: ICommandWithResult<TResult>): TResult;
    public SendCommand(commandOrType: ICommand | Constructor<ICommand>): any {
        return this.GetArchitecture().SendCommand(commandOrType as any);
    }

    public SendQuery<TResult>(query: IQuery<TResult>): TResult {
        return this.GetArchitecture().SendQuery(query);
    }

    public RegisterEvent<T>(onEvent: (e: T) => void, target?: object): IUnRegister;
    public RegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target?: object): IUnRegister;
    public RegisterEvent<T>(eventClassOrHandler: EventClass<T> | ((e: T) => void), onEventOrTarget?: ((e: T) => void) | object, target: object = null): IUnRegister {
        const args = resolveRegisterEventArgs(eventClassOrHandler, onEventOrTarget, target);
        return this.GetArchitecture().RegisterEvent(args.eventClass, args.onEvent, args.target);
    }

    public UnRegisterEvent<T>(eventClass: EventClass<T>, onEvent: (e: T) => void, target: object = null): void {
        this.GetArchitecture().UnRegisterEvent(eventClass, onEvent, target);
    }

    public abstract GetArchitecture(): IArchitecture;
}

// #endregion

// #region System

export interface ISystem extends
    IBelongToArchitecture, ICanSetArchitecture, ICanGetModel, ICanGetUtility,
    ICanRegisterEvent, ICanSendEvent, ICanGetSystem, ICanInit {
}

export abstract class AbstractSystem extends ArchitectureMember implements ISystem {

    public Initialized: boolean = false;

    public Init(): void {
        this.OnInit();
    }

    public Deinit(): void {
        this.OnDeinit();
    }

    protected abstract OnInit(): void;

    protected OnDeinit(): void { }
}

// #endregion

// #region Model

export interface IModel extends
    IBelongToArchitecture, ICanSetArchitecture, ICanGetUtility, ICanSendEvent, ICanInit {
}

export abstract class AbstractModel extends ArchitectureMember implements IModel {

    public Initialized: boolean = false;

    public Init(): void {
        this.OnInit();
    }

    public Deinit(): void {
        this.OnDeinit();
    }

    protected abstract OnInit(): void;

    protected OnDeinit(): void { }
}

// #endregion

// #region Utility

export interface IUtility {
}

// #endregion

// #region Command

export interface ICommand extends
    IBelongToArchitecture, ICanSetArchitecture, ICanGetSystem, ICanGetModel, ICanGetUtility,
    ICanSendEvent, ICanSendCommand, ICanSendQuery {
    Execute(): void;
}

export interface ICommandWithResult<TResult> extends
    IBelongToArchitecture, ICanSetArchitecture, ICanGetSystem, ICanGetModel, ICanGetUtility,
    ICanSendEvent, ICanSendCommand, ICanSendQuery {
    Execute(): TResult;
}

export abstract class AbstractCommand extends ArchitectureMember implements ICommand {

    public Execute(): void {
        this.OnExecute();
    }

    protected abstract OnExecute(): void;
}

export abstract class AbstractCommandWithResult<TResult> extends ArchitectureMember implements ICommandWithResult<TResult> {

    public Execute(): TResult {
        return this.OnExecute();
    }

    protected abstract OnExecute(): TResult;
}

// #endregion

// #region Query

export interface IQuery<TResult> extends
    IBelongToArchitecture, ICanSetArchitecture, ICanGetModel, ICanGetSystem, ICanGetUtility {
    Do(): TResult;
}

export abstract class AbstractQuery<TResult> extends ArchitectureMember implements IQuery<TResult> {

    public Do(): TResult {
        return this.OnDo();
    }

    protected abstract OnDo(): TResult;
}

// #endregion
