/****************************************************************************
 * Copyright (c) 2015 ~ 2024 liangxiegame MIT License
 *
 * FSMKit for Cocos Creator (TypeScript)
 ****************************************************************************/


import * as cc from 'cc';
// #region IState

export interface IState {
    Condition(): boolean;
    Enter(): void;
    Update(): void;
    FixedUpdate(): void;
    OnGUI(): void;
    Exit(): void;
}

export class CustomState implements IState {

    private mOnCondition: () => boolean = null;
    private mOnEnter: () => void = null;
    private mOnUpdate: () => void = null;
    private mOnFixedUpdate: () => void = null;
    private mOnGUI: () => void = null;
    private mOnExit: () => void = null;

    public OnCondition(onCondition: () => boolean): CustomState {
        this.mOnCondition = onCondition;
        return this;
    }

    public OnEnter(onEnter: () => void): CustomState {
        this.mOnEnter = onEnter;
        return this;
    }

    public OnUpdate(onUpdate: () => void): CustomState {
        this.mOnUpdate = onUpdate;
        return this;
    }

    public OnFixedUpdate(onFixedUpdate: () => void): CustomState {
        this.mOnFixedUpdate = onFixedUpdate;
        return this;
    }

    public OnGUI(onGUI: () => void): CustomState;
    public OnGUI(): void;
    public OnGUI(onGUI?: () => void): CustomState | void {
        if (onGUI !== undefined) {
            this.mOnGUI = onGUI;
            return this;
        }
        if (this.mOnGUI) {
            this.mOnGUI();
        }
    }

    public OnExit(onExit: () => void): CustomState {
        this.mOnExit = onExit;
        return this;
    }

    public Condition(): boolean {
        if (!this.mOnCondition) {
            return true;
        }
        return this.mOnCondition();
    }

    public Enter(): void {
        if (this.mOnEnter) {
            this.mOnEnter();
        }
    }

    public Update(): void {
        if (this.mOnUpdate) {
            this.mOnUpdate();
        }
    }

    public FixedUpdate(): void {
        if (this.mOnFixedUpdate) {
            this.mOnFixedUpdate();
        }
    }

    public Exit(): void {
        if (this.mOnExit) {
            this.mOnExit();
        }
    }
}

// #endregion

// #region FSM

export class FSM<T> {

    protected mStates: Map<T, IState> = new Map();

    private mCurrentState: IState = null;
    private mCurrentStateId: T = null;
    private mOnStateChanged: (prev: T, next: T) => void = null;

    public FrameCountOfCurrentState: number = 1;
    public SecondsOfCurrentState: number = 0;

    public get CurrentState(): IState {
        return this.mCurrentState;
    }

    public get CurrentStateId(): T {
        return this.mCurrentStateId;
    }

    public PreviousStateId: T = null;

    public AddState(id: T, state: IState): void {
        this.mStates.set(id, state);
    }

    public State(t: T): CustomState {
        if (this.mStates.has(t)) {
            return this.mStates.get(t) as CustomState;
        }
        const state = new CustomState();
        this.mStates.set(t, state);
        return state;
    }

    public OnStateChanged(onStateChanged: (prev: T, next: T) => void): void {
        const prev = this.mOnStateChanged;
        this.mOnStateChanged = (p, n) => {
            if (prev) {
                prev(p, n);
            }
            onStateChanged(p, n);
        };
    }

    public ChangeState(t: T): void {
        if (this.mCurrentStateId === t) {
            return;
        }
        const state = this.mStates.get(t);
        if (!state) {
            return;
        }
        if (this.mCurrentState && !state.Condition()) {
            return;
        }
        if (this.mCurrentState) {
            this.mCurrentState.Exit();
        }
        this.PreviousStateId = this.mCurrentStateId;
        this.mCurrentState = state;
        this.mCurrentStateId = t;
        if (this.mOnStateChanged) {
            this.mOnStateChanged(this.PreviousStateId, this.CurrentStateId);
        }
        this.FrameCountOfCurrentState = 1;
        this.SecondsOfCurrentState = 0;
        this.mCurrentState.Enter();
    }

    public StartState(t: T): void {
        const state = this.mStates.get(t);
        if (!state) {
            return;
        }
        this.PreviousStateId = t;
        this.mCurrentState = state;
        this.mCurrentStateId = t;
        this.FrameCountOfCurrentState = 0;
        this.SecondsOfCurrentState = 0;
        state.Enter();
    }

    public FixedUpdate(): void {
        if (this.mCurrentState) {
            this.mCurrentState.FixedUpdate();
        }
    }

    public Update(): void {
        if (this.mCurrentState) {
            this.mCurrentState.Update();
        }
        this.FrameCountOfCurrentState++;
        this.SecondsOfCurrentState += cc.director.getDeltaTime();
    }

    public OnGUI(): void {
        if (this.mCurrentState) {
            this.mCurrentState.OnGUI();
        }
    }

    public Clear(): void {
        this.mCurrentState = null;
        this.mCurrentStateId = null;
        this.mStates.clear();
    }
}

export abstract class AbstractState<TStateId, TTarget> implements IState {

    protected mFSM: FSM<TStateId>;
    protected mTarget: TTarget;

    public constructor(fsm: FSM<TStateId>, target: TTarget) {
        this.mFSM = fsm;
        this.mTarget = target;
    }

    public Condition(): boolean {
        return this.OnCondition();
    }

    public Enter(): void {
        this.OnEnter();
    }

    public Update(): void {
        this.OnUpdate();
    }

    public FixedUpdate(): void {
        this.OnFixedUpdate();
    }

    public OnGUI(): void {
    }

    public Exit(): void {
        this.OnExit();
    }

    protected OnCondition(): boolean {
        return true;
    }

    protected OnEnter(): void { }

    protected OnUpdate(): void { }

    protected OnFixedUpdate(): void { }

    protected OnExit(): void { }
}

// #endregion
