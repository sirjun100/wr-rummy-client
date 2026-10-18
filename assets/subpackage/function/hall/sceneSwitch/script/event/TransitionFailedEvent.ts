import type { TransitionMode } from "../config/TransitionConfig";

export class TransitionFailedEvent {
    public constructor(
        public readonly mode: TransitionMode,
        public readonly error: Error | string,
    ) {}
}
