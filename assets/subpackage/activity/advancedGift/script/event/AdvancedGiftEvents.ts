import { AdvancedGiftPageDto, AdvancedGiftRewardDto } from "../config/AdvancedGiftTypes";

export class AdvancedGiftClaimSuccessEvent {
    public constructor(
        public readonly reward: AdvancedGiftRewardDto,
        public readonly page: AdvancedGiftPageDto,
        public readonly tips: string,
    ) {}
}

export class AdvancedGiftFetchFailedEvent {
    public constructor(public readonly message: string) {}
}
