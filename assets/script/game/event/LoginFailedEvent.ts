export class LoginFailedEvent {
    public constructor(
        public readonly account: string,
        public readonly message: string,
        public readonly code: number = -1,
    ) {}
}
