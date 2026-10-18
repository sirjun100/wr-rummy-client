import type { PropsEquippedProfileDto } from "../config/PropsProtocol";

export class PropsProfileChangedEvent {
    public constructor(public readonly profile: PropsEquippedProfileDto) {}
}
