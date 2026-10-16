/**
 * 架构类型事件 — 放在 game/event/
 */
export class LoginSuccessEvent {
    public constructor(public readonly userId: string) {}
}

// 发送：
// GameApp.Interface.SendEvent(new LoginSuccessEvent("123"));

// 订阅（Controller）:
// this.RegisterEvent(LoginSuccessEvent, (e) => { ... }, this)
//     .UnRegisterWhenGameObjectDestroyed(this.node);
