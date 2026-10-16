/** 架构类型事件：登录成功 */
export class LoginSuccessEvent {
    public constructor(
        public readonly uid: number,
        public readonly account: string,
    ) {}
}
