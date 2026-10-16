import { BundleKey, SubGameId } from "../config/BundleManifest";

export class SubGameEnterEvent {
    public constructor(
        public readonly subGameId: SubGameId,
        public readonly bundleKey: BundleKey,
        public readonly bundleName: string,
        public readonly sceneName: string | null,
    ) {}
}

export class SubGameLeaveEvent {
    public constructor(public readonly previousSubGameId: SubGameId) {}
}
