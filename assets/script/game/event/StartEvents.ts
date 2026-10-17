export class StartProgressEvent {
    public constructor(
        public readonly stepIndex: number,
        public readonly progress: number,
    ) {}
}

export class HotUpdateStateEvent {
    public constructor(
        public readonly state: "checking" | "downloading" | "failed" | "needRestart" | "done",
        public readonly percent: number = 0,
    ) {}
}

export class BootstrapReadyEvent {}

export class NativeAuthResultEvent {
    public constructor(
        public readonly provider: "facebook" | "google" | "apple",
        public readonly accessToken: string,
        public readonly error: string = "",
    ) {}
}
