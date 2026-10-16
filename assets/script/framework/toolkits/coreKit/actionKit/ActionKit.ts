/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * ActionKit for Cocos Creator (TypeScript)
 ****************************************************************************/


import * as cc from 'cc';
import { EasyEvent, EasyEvent1 } from "../../../QFramework";
import { ListPool, SimpleObjectPool } from "../poolKit/PoolKit";
import { MonoSingleton } from "../singletonKit/SingletonKit";

// #region Enums & Interfaces

export enum ActionStatus {
    NotStart,
    Started,
    Finished,
}

export enum ActionUpdateModes {
    ScaledDeltaTime,
    UnscaledDeltaTime,
}

export interface IActionController {
    ActionID: number;
    Action: IAction;
    UpdateMode: ActionUpdateModes;
    Paused: boolean;
    Reset(): void;
    Deinit(): void;
}

export interface IAction {
    ActionID: number;
    Status: ActionStatus;
    Paused: boolean;
    Deinited: boolean;
    OnStart(): void;
    OnExecute(dt: number): void;
    OnFinish(): void;
    Reset(): void;
    Deinit(): void;
}

export interface ISequence extends IAction {
    Append(action: IAction): ISequence;
}

export interface IRepeat extends ISequence {
}

export interface IParallel extends ISequence {
}

export interface ICustomAPI<TData> {
    Data: TData;
    OnStart(onStart: () => void): ICustomAPI<TData>;
    OnExecute(onExecute: (dt: number) => void): ICustomAPI<TData>;
    OnFinish(onFinish: () => void): ICustomAPI<TData>;
    Finish(): void;
}

// #endregion

// #region ActionQueue

interface IActionQueueCallback {
    Call(): void;
}

class ActionQueueRecycleCallback<T> implements IActionQueueCallback {

    private pool: SimpleObjectPool<T>;
    private action: T;

    public constructor(pool: SimpleObjectPool<T>, action: T) {
        this.pool = pool;
        this.action = action;
    }

    public Call(): void {
        if (this.pool) {
            this.pool.Recycle(this.action);
        }
        this.pool = null;
        this.action = null;
    }
}

/** Runtime-only Component — no @ccclass (Cocos: one Component per script file). */
class ActionQueue extends MonoSingleton {

    private readonly mActionQueueCallbacks: IActionQueueCallback[] = [];

    public static AddCallback(callback: IActionQueueCallback): void {
        ActionQueue.GetInstance(ActionQueue).mActionQueueCallbacks.push(callback);
    }

    protected update(): void {
        if (this.mActionQueueCallbacks.length > 0) {
            for (let i = 0; i < this.mActionQueueCallbacks.length; i++) {
                this.mActionQueueCallbacks[i].Call();
            }
            this.mActionQueueCallbacks.length = 0;
        }
    }
}

// #endregion

// #region IAction Extensions

export function FinishAction(action: IAction): void {
    action.Status = ActionStatus.Finished;
}

export function ExecuteAction(action: IAction, dt: number): boolean {
    const status = action.Status;
    if (status === ActionStatus.NotStart) {
        action.OnStart();
        if (action.Status === ActionStatus.Finished) {
            action.OnFinish();
            return true;
        }
        action.Status = ActionStatus.Started;
    } else if (status === ActionStatus.Started) {
        if (action.Paused) {
            return false;
        }
        action.OnExecute(dt);
        if (action.Status === ActionStatus.Finished) {
            action.OnFinish();
            return true;
        }
    } else if (status === ActionStatus.Finished) {
        action.OnFinish();
        return true;
    }
    return false;
}

// #endregion

// #region ActionController

class ActionController implements IActionController {

    private static readonly mPool = new SimpleObjectPool<ActionController>(
        () => new ActionController(),
        (controller) => {
            controller.UpdateMode = ActionUpdateModes.ScaledDeltaTime;
            controller.ActionID = 0;
            controller.Action = null;
        },
        50
    );

    public ActionID: number = 0;
    public Action: IAction = null;
    public UpdateMode: ActionUpdateModes = ActionUpdateModes.ScaledDeltaTime;

    public get Paused(): boolean {
        return this.Action ? this.Action.Paused : false;
    }

    public set Paused(value: boolean) {
        if (this.Action) {
            this.Action.Paused = value;
        }
    }

    public Reset(): void {
        if (this.Action && this.Action.ActionID === this.ActionID) {
            this.Action.Reset();
        }
    }

    public static Allocate(): ActionController {
        return ActionController.mPool.Allocate();
    }

    public Deinit(): void {
        if (this.Action && this.Action.ActionID === this.ActionID) {
            this.Action.Deinit();
            ActionController.mPool.Recycle(this);
        }
    }
}

export function PauseController(controller: IActionController): void {
    if (controller.ActionID === controller.Action.ActionID) {
        controller.Action.Paused = true;
    }
}

export function ResumeController(controller: IActionController): void {
    if (controller.ActionID === controller.Action.ActionID) {
        controller.Action.Paused = false;
    }
}

export function IgnoreTimeScale(controller: IActionController): IActionController {
    controller.UpdateMode = ActionUpdateModes.UnscaledDeltaTime;
    return controller;
}

// #endregion

// #region MonoUpdateActionExecutor

class ActionTask {
    public Action: IAction = null;
    public Controller: IActionController = null;
    public OnFinish: (controller: IActionController) => void = null;
}

/** Runtime-only Component — no @ccclass (Cocos: one Component per script file). */
class MonoUpdateActionExecutor extends cc.Component {

    private static readonly mActionTaskPool = new SimpleObjectPool<ActionTask>(
        () => new ActionTask(),
        (task) => {
            task.Action = null;
            task.Controller = null;
            task.OnFinish = null;
        },
        50
    );

    private readonly mPrepareExecutionActions: ActionTask[] = [];
    private readonly mExecutingActions: Map<IAction, ActionTask> = new Map();
    private readonly mToActionRemove: IAction[] = [];

    public Execute(controller: IActionController, onFinish: (controller: IActionController) => void = null): void {
        if (controller.Action.Status === ActionStatus.Finished) {
            controller.Action.Reset();
        }
        if (this.UpdateAction(controller, 0, onFinish)) {
            return;
        }
        const actionTask = MonoUpdateActionExecutor.mActionTaskPool.Allocate();
        actionTask.Action = controller.Action;
        actionTask.Controller = controller;
        actionTask.OnFinish = onFinish;
        this.mPrepareExecutionActions.push(actionTask);
    }

    private UpdateAction(controller: IActionController, dt: number, onFinish: (controller: IActionController) => void): boolean {
        if (ExecuteAction(controller.Action, dt)) {
            if (onFinish) {
                onFinish(controller);
            }
            controller.Deinit();
            return true;
        }
        return false;
    }

    protected update(): void {
        if (this.mPrepareExecutionActions.length > 0) {
            for (let i = 0; i < this.mPrepareExecutionActions.length; i++) {
                const prepareExecutionAction = this.mPrepareExecutionActions[i];
                this.mExecutingActions.set(prepareExecutionAction.Action, prepareExecutionAction);
            }
            this.mPrepareExecutionActions.length = 0;
        }

        this.mExecutingActions.forEach((actionAndFinishCallback) => {
            let dt = cc.director.getDeltaTime();
            if (actionAndFinishCallback.Controller.UpdateMode === ActionUpdateModes.UnscaledDeltaTime) {
                dt = cc.director.getDeltaTime();
            }
            if (this.UpdateAction(actionAndFinishCallback.Controller, dt, actionAndFinishCallback.OnFinish)) {
                this.mToActionRemove.push(actionAndFinishCallback.Action);
            }
        });

        if (this.mToActionRemove.length > 0) {
            for (let i = 0; i < this.mToActionRemove.length; i++) {
                this.mExecutingActions.delete(this.mToActionRemove[i]);
            }
            this.mToActionRemove.length = 0;
        }
    }
}

function GetOrAddMonoUpdateActionExecutor(component: cc.Component): MonoUpdateActionExecutor {
    let executor = component.node.getComponent(MonoUpdateActionExecutor);
    if (!executor) {
        executor = component.node.addComponent(MonoUpdateActionExecutor);
    }
    return executor;
}

export function ExecuteByUpdate(
    component: cc.Component,
    action: IAction,
    controller: IActionController,
    onFinish: (controller: IActionController) => void = null
): IAction {
    if (action.Status === ActionStatus.Finished) {
        action.Reset();
    }
    GetOrAddMonoUpdateActionExecutor(component).Execute(controller, onFinish);
    return action;
}

export function StartAction(
    action: IAction,
    component: cc.Component,
    onFinish: ((controller: IActionController) => void) | (() => void) = null
): IActionController {
    const controller = ActionController.Allocate();
    controller.ActionID = action.ActionID;
    controller.Action = action;
    controller.UpdateMode = ActionUpdateModes.ScaledDeltaTime;
    if (onFinish && onFinish.length > 0) {
        ExecuteByUpdate(component, action, controller, onFinish as (controller: IActionController) => void);
    } else if (onFinish) {
        ExecuteByUpdate(component, action, controller, () => (onFinish as () => void)());
    } else {
        ExecuteByUpdate(component, action, controller, null);
    }
    return controller;
}

export interface IActionWithStart extends IAction {
    Start(component: cc.Component, onFinish?: (() => void) | ((controller: IActionController) => void)): IActionController;
    StartCurrentScene(onFinish?: (() => void) | ((controller: IActionController) => void)): IActionController;
    StartGlobal(onFinish?: (() => void) | ((controller: IActionController) => void)): IActionController;
}

function AttachActionStart<T extends IAction>(action: T): T {
    const withStart = action as T & IActionWithStart;
    withStart.Start = (component, onFinish) => StartAction(action, component, onFinish);
    withStart.StartCurrentScene = (onFinish) => StartActionCurrentScene(action, onFinish);
    withStart.StartGlobal = (onFinish) => StartActionGlobal(action, onFinish);
    return withStart;
}

// #endregion

// #region ActionKitMonoBehaviourEvents

/** Runtime-only Component — no @ccclass (Cocos: one Component per script file). */
class ActionKitMonoBehaviourEvents extends MonoSingleton {

    public readonly OnUpdate: EasyEvent = new EasyEvent();
    public readonly OnLateUpdate: EasyEvent = new EasyEvent();
    public readonly OnGUIEvent: EasyEvent = new EasyEvent();
    public readonly OnApplicationFocusEvent: EasyEvent1<boolean> = new EasyEvent1<boolean>();
    public readonly OnApplicationPauseEvent: EasyEvent1<boolean> = new EasyEvent1<boolean>();
    public readonly OnApplicationQuitEvent: EasyEvent = new EasyEvent();

    public static FrameCount: number = 0;

    protected onLoad(): void {
        this.node.name = "ActionKitMonoBehaviourEvents";
    }

    protected update(): void {
        ActionKitMonoBehaviourEvents.FrameCount++;
        this.OnUpdate.Trigger();
        ActionQueue.GetInstance(ActionQueue);
    }

    protected lateUpdate(): void {
        this.OnLateUpdate.Trigger();
    }

    protected onDestroy(): void {
        this.OnApplicationQuitEvent.Trigger();
    }
}

/** Runtime-only Component — no @ccclass (Cocos: one Component per script file). */
class ActionKitCurrentScene extends cc.Component {

    private static mSceneComponent: ActionKitCurrentScene = null;

    public static get SceneComponent(): ActionKitCurrentScene {
        if (!ActionKitCurrentScene.mSceneComponent || !cc.isValid(ActionKitCurrentScene.mSceneComponent)) {
            const scene = cc.director.getScene();
            const node = new cc.Node("ActionKitCurrentScene");
            if (scene) {
                scene.addChild(node);
            }
            ActionKitCurrentScene.mSceneComponent = node.addComponent(ActionKitCurrentScene);
        }
        return ActionKitCurrentScene.mSceneComponent;
    }

    protected onDestroy(): void {
        ActionKitCurrentScene.mSceneComponent = null;
    }
}

export function StartActionCurrentScene(
    action: IAction,
    onFinish: ((controller: IActionController) => void) | (() => void) = null
): IActionController {
    return StartAction(action, ActionKitCurrentScene.SceneComponent, onFinish);
}

export function StartActionGlobal(
    action: IAction,
    onFinish: ((controller: IActionController) => void) | (() => void) = null
): IActionController {
    return StartAction(action, ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents), onFinish);
}

// #endregion

// #region Delay

class DelayAction implements IAction {

    private static readonly mPool = new SimpleObjectPool<DelayAction>(() => new DelayAction(), null, 10);

    public DelayTime: number = 0;
    public DelayTimeFactory: () => number = null;
    public OnDelayFinish: () => void = null;
    public CurrentSeconds: number = 0;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(seconds: number, onDelayFinish: () => void = null): DelayAction {
        const retNode = DelayAction.mPool.Allocate();
        retNode.ActionID = ActionKit.ID_GENERATOR++;
        retNode.Deinited = false;
        retNode.Reset();
        retNode.DelayTime = seconds;
        retNode.OnDelayFinish = onDelayFinish;
        retNode.CurrentSeconds = 0;
        return AttachActionStart(retNode);
    }

    public static AllocateFactory(delayTimeFactory: () => number, onDelayFinish: () => void = null): DelayAction {
        const retNode = DelayAction.mPool.Allocate();
        retNode.ActionID = ActionKit.ID_GENERATOR++;
        retNode.Deinited = false;
        retNode.Reset();
        retNode.DelayTimeFactory = delayTimeFactory;
        retNode.OnDelayFinish = onDelayFinish;
        retNode.CurrentSeconds = 0;
        return AttachActionStart(retNode);
    }

    public OnStart(): void {
        if (this.DelayTimeFactory) {
            this.DelayTime = this.DelayTimeFactory();
        }
    }

    public OnExecute(dt: number): void {
        if (this.CurrentSeconds >= this.DelayTime) {
            FinishAction(this);
            if (this.OnDelayFinish) {
                this.OnDelayFinish();
            }
        }
        this.CurrentSeconds += dt;
    }

    public OnFinish(): void { }

    public Reset(): void {
        this.Status = ActionStatus.NotStart;
        this.Paused = false;
        this.CurrentSeconds = 0;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.OnDelayFinish = null;
            this.DelayTimeFactory = null;
            this.Deinited = true;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<DelayAction>(DelayAction.mPool, this));
        }
    }
}

// #endregion

// #region DelayFrame

class DelayFrameAction implements IAction {

    private static readonly mPool = new SimpleObjectPool<DelayFrameAction>(() => new DelayFrameAction(), null, 10);

    private mStartFrameCount: number = 0;
    private mDelayedFrameCount: number = 0;
    private mOnDelayFinish: () => void = null;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(frameCount: number, onDelayFinish: () => void = null): DelayFrameAction {
        const delayFrame = DelayFrameAction.mPool.Allocate();
        delayFrame.ActionID = ActionKit.ID_GENERATOR++;
        delayFrame.Reset();
        delayFrame.Deinited = false;
        delayFrame.mDelayedFrameCount = frameCount;
        delayFrame.mOnDelayFinish = onDelayFinish;
        return AttachActionStart(delayFrame);
    }

    public OnStart(): void {
        this.mStartFrameCount = ActionKitMonoBehaviourEvents.FrameCount;
    }

    public OnExecute(dt: number): void {
        if (ActionKitMonoBehaviourEvents.FrameCount >= this.mStartFrameCount + this.mDelayedFrameCount) {
            if (this.mOnDelayFinish) {
                this.mOnDelayFinish();
            }
            FinishAction(this);
        }
    }

    public OnFinish(): void { }

    public Reset(): void {
        this.Status = ActionStatus.NotStart;
        this.Paused = false;
        this.mStartFrameCount = 0;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.mOnDelayFinish = null;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<DelayFrameAction>(DelayFrameAction.mPool, this));
        }
    }
}

// #endregion

// #region Callback

class CallbackAction implements IAction {

    private static readonly mPool = new SimpleObjectPool<CallbackAction>(() => new CallbackAction(), null, 10);

    private mCallback: () => void = null;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(callback: () => void): CallbackAction {
        const callbackAction = CallbackAction.mPool.Allocate();
        callbackAction.ActionID = ActionKit.ID_GENERATOR++;
        callbackAction.Reset();
        callbackAction.Deinited = false;
        callbackAction.mCallback = callback;
        return AttachActionStart(callbackAction);
    }

    public OnStart(): void {
        if (this.mCallback) {
            this.mCallback();
        }
        FinishAction(this);
    }

    public OnExecute(dt: number): void { }

    public OnFinish(): void { }

    public Reset(): void {
        this.Paused = false;
        this.Status = ActionStatus.NotStart;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.mCallback = null;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<CallbackAction>(CallbackAction.mPool, this));
        }
    }
}

// #endregion

// #region Condition

export class ConditionAction implements IAction {

    private static readonly mPool = new SimpleObjectPool<ConditionAction>(() => new ConditionAction(), null, 10);

    private mCondition: () => boolean = null;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(condition: () => boolean): ConditionAction {
        const conditionAction = ConditionAction.mPool.Allocate();
        conditionAction.ActionID = ActionKit.ID_GENERATOR++;
        conditionAction.Deinited = false;
        conditionAction.Reset();
        conditionAction.mCondition = condition;
        return AttachActionStart(conditionAction);
    }

    public OnStart(): void { }

    public OnExecute(dt: number): void {
        if (this.mCondition && this.mCondition()) {
            FinishAction(this);
        }
    }

    public OnFinish(): void { }

    public Reset(): void {
        this.Paused = false;
        this.Status = ActionStatus.NotStart;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.mCondition = null;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<ConditionAction>(ConditionAction.mPool, this));
        }
    }
}

// #endregion

// #region Sequence

class SequenceAction implements ISequence {

    private static readonly mPool = new SimpleObjectPool<SequenceAction>(() => new SequenceAction(), null, 10);

    private mCurrentAction: IAction = null;
    private mCurrentActionIndex: number = 0;
    private readonly mActions: IAction[] = ListPool.Get<IAction>();

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(): ISequence {
        const sequence = SequenceAction.mPool.Allocate();
        sequence.ActionID = ActionKit.ID_GENERATOR++;
        sequence.Reset();
        sequence.Deinited = false;
        return patchSequenceExtensions(AttachActionStart(sequence));
    }

    public OnStart(): void {
        if (this.mActions.length > 0) {
            this.mCurrentActionIndex = 0;
            this.mCurrentAction = this.mActions[this.mCurrentActionIndex];
            this.mCurrentAction.Reset();
            this.TryExecuteUntilNextNotFinished();
        } else {
            FinishAction(this);
        }
    }

    private TryExecuteUntilNextNotFinished(): void {
        while (this.mCurrentAction != null && ExecuteAction(this.mCurrentAction, 0)) {
            this.mCurrentActionIndex++;
            if (this.mCurrentActionIndex < this.mActions.length) {
                this.mCurrentAction = this.mActions[this.mCurrentActionIndex];
                this.mCurrentAction.Reset();
            } else {
                this.mCurrentAction = null;
                FinishAction(this);
            }
        }
    }

    public OnExecute(dt: number): void {
        if (this.mCurrentAction != null) {
            if (ExecuteAction(this.mCurrentAction, dt)) {
                this.mCurrentActionIndex++;
                if (this.mCurrentActionIndex < this.mActions.length) {
                    this.mCurrentAction = this.mActions[this.mCurrentActionIndex];
                    this.mCurrentAction.Reset();
                    this.TryExecuteUntilNextNotFinished();
                } else {
                    FinishAction(this);
                }
            }
        } else {
            FinishAction(this);
        }
    }

    public OnFinish(): void { }

    public Append(action: IAction): ISequence {
        this.mActions.push(action);
        return this;
    }

    public Reset(): void {
        this.mCurrentActionIndex = 0;
        this.Status = ActionStatus.NotStart;
        this.Paused = false;
        for (let i = 0; i < this.mActions.length; i++) {
            this.mActions[i].Reset();
        }
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            for (let i = 0; i < this.mActions.length; i++) {
                this.mActions[i].Deinit();
            }
            this.mActions.length = 0;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<SequenceAction>(SequenceAction.mPool, this));
        }
    }
}

// #endregion

// #region Repeat

export class RepeatAction implements IRepeat {

    private static readonly mPool = new SimpleObjectPool<RepeatAction>(() => new RepeatAction(), null, 5);

    private mSequence: ISequence = null;
    private mRepeatCount: number = -1;
    private mCurrentRepeatCount: number = 0;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(repeatCount: number = -1): IRepeat {
        const repeat = RepeatAction.mPool.Allocate();
        repeat.ActionID = ActionKit.ID_GENERATOR++;
        repeat.mSequence = SequenceAction.Allocate();
        repeat.Deinited = false;
        repeat.Reset();
        repeat.mRepeatCount = repeatCount;
        return patchSequenceExtensions(AttachActionStart(repeat)) as IRepeat;
    }

    public OnStart(): void {
        this.mCurrentRepeatCount = 0;
    }

    public OnExecute(dt: number): void {
        if (this.mRepeatCount === -1 || this.mRepeatCount === 0) {
            if (ExecuteAction(this.mSequence, dt)) {
                this.mSequence.Reset();
            }
        } else if (this.mCurrentRepeatCount < this.mRepeatCount) {
            if (ExecuteAction(this.mSequence, dt)) {
                this.mCurrentRepeatCount++;
                if (this.mCurrentRepeatCount >= this.mRepeatCount) {
                    FinishAction(this);
                } else {
                    this.mSequence.Reset();
                }
            }
        }
    }

    public OnFinish(): void { }

    public Append(action: IAction): ISequence {
        this.mSequence.Append(action);
        return this;
    }

    public Reset(): void {
        this.mCurrentRepeatCount = 0;
        this.Status = ActionStatus.NotStart;
        this.Paused = false;
        this.mSequence.Reset();
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.mSequence.Deinit();
            this.mSequence = null;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<RepeatAction>(RepeatAction.mPool, this));
        }
    }
}

// #endregion

// #region Parallel

class ParallelAction implements IParallel {

    private static readonly mPool = new SimpleObjectPool<ParallelAction>(() => new ParallelAction(), null, 5);

    private readonly mActions: IAction[] = ListPool.Get<IAction>();
    private mFinishedCount: number = 0;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(): IParallel {
        const parallel = ParallelAction.mPool.Allocate();
        parallel.ActionID = ActionKit.ID_GENERATOR++;
        parallel.Deinited = false;
        parallel.Reset();
        return patchSequenceExtensions(AttachActionStart(parallel)) as IParallel;
    }

    public OnStart(): void { }

    public OnExecute(dt: number): void {
        for (let i = this.mFinishedCount; i < this.mActions.length; i++) {
            if (!ExecuteAction(this.mActions[i], dt)) {
                continue;
            }
            this.mFinishedCount++;
            if (this.mFinishedCount >= this.mActions.length) {
                FinishAction(this);
            } else {
                const temp = this.mActions[i];
                this.mActions[i] = this.mActions[this.mFinishedCount - 1];
                this.mActions[this.mFinishedCount - 1] = temp;
            }
        }
    }

    public OnFinish(): void { }

    public Append(action: IAction): ISequence {
        this.mActions.push(action);
        return this;
    }

    public Reset(): void {
        this.Status = ActionStatus.NotStart;
        this.mFinishedCount = 0;
        this.Paused = false;
        for (let i = 0; i < this.mActions.length; i++) {
            this.mActions[i].Reset();
        }
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            for (let i = 0; i < this.mActions.length; i++) {
                this.mActions[i].Deinit();
            }
            this.mActions.length = 0;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<ParallelAction>(ParallelAction.mPool, this));
        }
    }
}

// #endregion

// #region Lerp

export class LerpAction implements IAction {

    private static readonly mPool = new SimpleObjectPool<LerpAction>(() => new LerpAction(), null, 10);

    public A: number = 0;
    public B: number = 0;
    public Duration: number = 0;
    public OnLerp: (value: number) => void = null;
    public OnLerpFinish: () => void = null;

    private mCurrentTime: number = 0;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public static Allocate(
        a: number,
        b: number,
        duration: number,
        onLerp: (value: number) => void = null,
        onLerpFinish: () => void = null
    ): LerpAction {
        const retNode = LerpAction.mPool.Allocate();
        retNode.ActionID = ActionKit.ID_GENERATOR++;
        retNode.Deinited = false;
        retNode.Reset();
        retNode.A = a;
        retNode.B = b;
        retNode.Duration = duration;
        retNode.OnLerp = onLerp;
        retNode.OnLerpFinish = onLerpFinish;
        return AttachActionStart(retNode);
    }

    private static LerpValue(a: number, b: number, t: number): number {
        return a + (b - a) * t;
    }

    public OnStart(): void {
        this.mCurrentTime = 0;
        if (this.OnLerp) {
            this.OnLerp(LerpAction.LerpValue(this.A, this.B, 0));
        }
    }

    public OnExecute(dt: number): void {
        this.mCurrentTime += dt;
        if (this.mCurrentTime < this.Duration) {
            if (this.OnLerp) {
                this.OnLerp(LerpAction.LerpValue(this.A, this.B, this.mCurrentTime / this.Duration));
            }
        } else {
            FinishAction(this);
        }
    }

    public OnFinish(): void {
        if (this.OnLerp) {
            this.OnLerp(LerpAction.LerpValue(this.A, this.B, 1));
        }
        if (this.OnLerpFinish) {
            this.OnLerpFinish();
        }
    }

    public Reset(): void {
        this.Status = ActionStatus.NotStart;
        this.Paused = false;
        this.mCurrentTime = 0;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.OnLerp = null;
            this.OnLerpFinish = null;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<LerpAction>(LerpAction.mPool, this));
        }
    }
}

// #endregion

// #region Custom

class CustomAction<TData> implements IAction, ICustomAPI<TData> {

    public Data: TData = null;

    protected mOnStart: () => void = null;
    protected mOnExecute: (dt: number) => void = null;
    protected mOnFinish: () => void = null;

    public ActionID: number = 0;
    public Status: ActionStatus = ActionStatus.NotStart;
    public Paused: boolean = false;
    public Deinited: boolean = false;

    public OnStart(): void;
    public OnStart(onStart: () => void): ICustomAPI<TData>;
    public OnStart(onStart?: () => void): void | ICustomAPI<TData> {
        if (onStart !== undefined) {
            this.mOnStart = onStart;
            return this;
        }
        if (this.mOnStart) {
            this.mOnStart();
        }
    }

    public OnExecute(dt: number): void;
    public OnExecute(onExecute: (dt: number) => void): ICustomAPI<TData>;
    public OnExecute(arg?: number | ((dt: number) => void)): void | ICustomAPI<TData> {
        if (typeof arg === "function") {
            this.mOnExecute = arg;
            return this;
        }
        if (this.mOnExecute) {
            this.mOnExecute(arg as number);
        }
    }

    public OnFinish(): void;
    public OnFinish(onFinish: () => void): ICustomAPI<TData>;
    public OnFinish(onFinish?: () => void): void | ICustomAPI<TData> {
        if (onFinish !== undefined) {
            this.mOnFinish = onFinish;
            return this;
        }
        if (this.mOnFinish) {
            this.mOnFinish();
        }
    }

    public Finish(): void {
        this.Status = ActionStatus.Finished;
    }

    public Reset(): void {
        this.Paused = false;
        this.Status = ActionStatus.NotStart;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.mOnStart = null;
            this.mOnExecute = null;
            this.mOnFinish = null;
        }
    }
}

class CustomObjectAction extends CustomAction<object> {

    private static readonly mPool = new SimpleObjectPool<CustomObjectAction>(() => new CustomObjectAction(), null, 10);

    public static AllocateObject(): CustomObjectAction {
        const custom = CustomObjectAction.mPool.Allocate();
        custom.ActionID = ActionKit.ID_GENERATOR++;
        custom.Deinited = false;
        custom.Reset();
        return custom;
    }

    public Deinit(): void {
        if (!this.Deinited) {
            this.Deinited = true;
            this.mOnStart = null;
            this.mOnExecute = null;
            this.mOnFinish = null;
            ActionQueue.AddCallback(new ActionQueueRecycleCallback<CustomObjectAction>(CustomObjectAction.mPool, this));
        }
    }
}

const customDataPools: Map<string, SimpleObjectPool<CustomAction<any>>> = new Map();

function GetCustomDataPool<TData>(): SimpleObjectPool<CustomAction<TData>> {
    const key = "CustomAction";
    if (!customDataPools.has(key)) {
        customDataPools.set(key, new SimpleObjectPool<CustomAction<any>>(() => new PooledCustomAction<any>(), null, 10));
    }
    return customDataPools.get(key) as SimpleObjectPool<CustomAction<TData>>;
}

function AllocateCustomData<TData>(): CustomAction<TData> {
    const pool = GetCustomDataPool<TData>();
    const custom = pool.Allocate();
    custom.ActionID = ActionKit.ID_GENERATOR++;
    custom.Deinited = false;
    custom.Reset();
    return custom;
}

class PooledCustomAction<TData> extends CustomAction<TData> {

    public Deinit(): void {
        DeinitCustomData(this);
    }
}

function DeinitCustomData<TData>(action: CustomAction<TData>): void {
    if (!action.Deinited) {
        action.Deinited = true;
        (action as PooledCustomAction<TData>)["mOnStart"] = null;
        (action as PooledCustomAction<TData>)["mOnExecute"] = null;
        (action as PooledCustomAction<TData>)["mOnFinish"] = null;
        ActionQueue.AddCallback(new ActionQueueRecycleCallback<CustomAction<TData>>(GetCustomDataPool<TData>(), action));
    }
}

// #endregion

// #region ISequence Extensions

export function SequenceAppendNested(self: ISequence, sequenceSetting: (sequence: ISequence) => void): ISequence {
    const sequence = SequenceAction.Allocate();
    sequenceSetting(sequence);
    return self.Append(sequence);
}

export function SequenceDelay(self: ISequence, seconds: number, onDelayFinish: () => void = null): ISequence {
    return self.Append(DelayAction.Allocate(seconds, onDelayFinish));
}

export function SequenceDelayFactory(self: ISequence, delayTimeFactory: () => number, onDelayFinish: () => void = null): ISequence {
    return self.Append(DelayAction.AllocateFactory(delayTimeFactory, onDelayFinish));
}

export function SequenceDelayFrame(self: ISequence, frameCount: number): ISequence {
    return self.Append(DelayFrameAction.Allocate(frameCount));
}

export function SequenceNextFrame(self: ISequence): ISequence {
    return self.Append(DelayFrameAction.Allocate(1));
}

export function SequenceCallback(self: ISequence, callback: () => void): ISequence {
    return self.Append(CallbackAction.Allocate(callback));
}

export function SequenceCondition(self: ISequence, condition: () => boolean): ISequence {
    return self.Append(ConditionAction.Allocate(condition));
}

export function SequenceLerp(
    self: ISequence,
    a: number,
    b: number,
    duration: number,
    onLerp: (value: number) => void = null,
    onLerpFinish: () => void = null
): ISequence {
    return self.Append(LerpAction.Allocate(a, b, duration, onLerp, onLerpFinish));
}

export function SequenceLerp01(
    self: ISequence,
    duration: number,
    onLerp: (value: number) => void = null,
    onLerpFinish: () => void = null
): ISequence {
    return self.Append(LerpAction.Allocate(0, 1, duration, onLerp, onLerpFinish));
}

export function SequenceParallel(self: ISequence, parallelSetting: (parallel: ISequence) => void): ISequence {
    const parallel = ParallelAction.Allocate();
    parallelSetting(parallel);
    return self.Append(parallel);
}

export function SequenceRepeat(self: ISequence, repeatSetting: (repeat: IRepeat) => void): ISequence;
export function SequenceRepeat(self: ISequence, repeatCount: number, repeatSetting: (repeat: IRepeat) => void): ISequence;
export function SequenceRepeat(
    self: ISequence,
    repeatCountOrSetting: number | ((repeat: IRepeat) => void),
    repeatSetting?: (repeat: IRepeat) => void
): ISequence {
    let repeat: IRepeat;
    if (typeof repeatCountOrSetting === "function") {
        repeat = RepeatAction.Allocate();
        repeatCountOrSetting(repeat);
    } else {
        repeat = RepeatAction.Allocate(repeatCountOrSetting);
        if (repeatSetting) {
            repeatSetting(repeat);
        }
    }
    return self.Append(repeat);
}

export function SequenceCustom(self: ISequence, onCustomSetting: (api: ICustomAPI<object>) => void): ISequence {
    return self.Append(ActionKit.Custom(onCustomSetting));
}

export function SequenceCustomData<TData>(self: ISequence, onCustomSetting: (api: ICustomAPI<TData>) => void): ISequence {
    return self.Append(ActionKit.CustomWithData(onCustomSetting));
}

// Chainable prototype-style helpers on ISequence instances
function patchSequenceExtensions(sequence: ISequence): ISequence {
  (sequence as any).Sequence = function (setting: (s: ISequence) => void) { return SequenceAppendNested(this, setting); };
  (sequence as any).Delay = function (seconds: number, onFinish?: () => void) { return SequenceDelay(this, seconds, onFinish); };
  (sequence as any).DelayFrame = function (frameCount: number) { return SequenceDelayFrame(this, frameCount); };
  (sequence as any).NextFrame = function () { return SequenceNextFrame(this); };
  (sequence as any).Callback = function (cb: () => void) { return SequenceCallback(this, cb); };
  (sequence as any).Condition = function (cond: () => boolean) { return SequenceCondition(this, cond); };
  (sequence as any).Lerp = function (a: number, b: number, duration: number, onLerp?: (v: number) => void, onFinish?: () => void) {
    return SequenceLerp(this, a, b, duration, onLerp, onFinish);
  };
  (sequence as any).Lerp01 = function (duration: number, onLerp?: (v: number) => void, onFinish?: () => void) {
    return SequenceLerp01(this, duration, onLerp, onFinish);
  };
  (sequence as any).Parallel = function (setting: (p: ISequence) => void) { return SequenceParallel(this, setting); };
  (sequence as any).Repeat = function (countOrSetting: any, setting?: any) {
    if (typeof countOrSetting === "function") {
      return SequenceRepeat(this, countOrSetting);
    }
    return SequenceRepeat(this, countOrSetting, setting);
  };
  (sequence as any).Custom = function (setting: (api: ICustomAPI<object>) => void) { return SequenceCustom(this, setting); };
  return sequence;
}

// #endregion

// #region ActionKit

export class ActionKit {

    public static ID_GENERATOR: number = 0;

    public static Delay(seconds: number, callback: () => void = null): IAction {
        return DelayAction.Allocate(seconds, callback);
    }

    public static Sequence(): ISequence {
        return patchSequenceExtensions(SequenceAction.Allocate());
    }

    public static DelayFrame(frameCount: number, onDelayFinish: () => void = null): IAction {
        return DelayFrameAction.Allocate(frameCount, onDelayFinish);
    }

    public static NextFrame(onNextFrame: () => void): IAction {
        return DelayFrameAction.Allocate(1, onNextFrame);
    }

    public static Lerp(
        a: number,
        b: number,
        duration: number,
        onLerp: (value: number) => void = null,
        onLerpFinish: () => void = null
    ): IAction {
        return LerpAction.Allocate(a, b, duration, onLerp, onLerpFinish);
    }

    public static Callback(callback: () => void): IAction {
        return CallbackAction.Allocate(callback);
    }

    public static Repeat(repeatCount: number = -1): IRepeat {
        return patchSequenceExtensions(RepeatAction.Allocate(repeatCount) as any) as IRepeat;
    }

    public static Parallel(): IParallel {
        return patchSequenceExtensions(ParallelAction.Allocate() as any) as IParallel;
    }

    public static Custom(customSetting: (api: ICustomAPI<object>) => void): IAction {
        const action = CustomObjectAction.AllocateObject();
        customSetting(action);
        return AttachActionStart(action);
    }

    public static CustomWithData<TData>(customSetting: (api: ICustomAPI<TData>) => void): IAction {
        const action = AllocateCustomData<TData>();
        customSetting(action);
        return AttachActionStart(action);
    }

    public static get OnUpdate(): EasyEvent {
        return ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents).OnUpdate;
    }

    public static get OnLateUpdate(): EasyEvent {
        return ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents).OnLateUpdate;
    }

    public static get OnGUI(): EasyEvent {
        return ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents).OnGUIEvent;
    }

    public static get OnApplicationQuit(): EasyEvent {
        return ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents).OnApplicationQuitEvent;
    }

    public static get OnApplicationPause(): EasyEvent1<boolean> {
        return ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents).OnApplicationPauseEvent;
    }

    public static get OnApplicationFocus(): EasyEvent1<boolean> {
        return ActionKitMonoBehaviourEvents.GetInstance(ActionKitMonoBehaviourEvents).OnApplicationFocusEvent;
    }
}

// IAction.Start extension parity（也可直接用 action.Start(this)）
export function Start(action: IAction, component: cc.Component, onFinish?: (() => void) | ((controller: IActionController) => void)): IActionController {
    return StartAction(action, component, onFinish);
}

// #endregion
