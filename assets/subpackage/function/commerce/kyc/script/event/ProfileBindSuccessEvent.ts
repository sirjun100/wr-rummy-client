import type { PersonBindType } from "../config/VerifyProtocol";

export class ProfileBindSuccessEvent {
    public constructor(public readonly bindType: PersonBindType) {}
}
