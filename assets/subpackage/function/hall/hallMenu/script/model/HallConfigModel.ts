import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { HallConfigDto, HallHelpDto, RummyRuleFlagsDto } from "../config/HallConfig";

export class HallConfigModel extends AbstractModel {
    public readonly config = new BindableProperty<HallConfigDto>({ chips_model: 0, pingbi: {} });
    public readonly help = new BindableProperty<HallHelpDto>({});

    protected OnInit(): void {}

    public applyConfig(dto: HallConfigDto): void {
        this.config.value = { ...dto };
    }

    public applyHelp(dto: HallHelpDto): void {
        this.help.value = { ...dto };
    }

    public isRedeemBlocked(): boolean {
        return (this.config.value.pingbi?.redeemcode ?? 0) === 1;
    }

    public isInviteBlocked(): boolean {
        return (this.config.value.pingbi?.invite ?? 0) === 1;
    }

    public isClubBlocked(): boolean {
        return (this.config.value.pingbi?.club ?? 0) === 1;
    }

    public get chipsModel(): boolean {
        return (this.config.value.chips_model ?? 0) === 1;
    }

    public getRummyRuleFlags(): RummyRuleFlagsDto {
        return this.config.value.rummy_rules ?? {};
    }

    public isPointsEasyMode(): boolean {
        return Number(this.getRummyRuleFlags().points_mode ?? 0) === 1;
    }

    public isMultipleRummyOpen(): boolean {
        const f = this.getRummyRuleFlags();
        return this.chipsModel
            ? Number(f.chip_multiple_rummy_open ?? 0) === 1
            : Number(f.multiple_rummy_open ?? 0) === 1;
    }

    public isBumpRummyOpen(): boolean {
        const f = this.getRummyRuleFlags();
        return this.chipsModel
            ? Number(f.chip_bump_rummy_open ?? 0) === 1
            : Number(f.bump_rummy_open ?? 0) === 1;
    }

    public isDouble6Open(): boolean {
        const f = this.getRummyRuleFlags();
        return this.chipsModel
            ? Number(f.chip_double_6_open ?? 0) === 1
            : Number(f.double_6_open ?? 0) === 1;
    }

    public clear(): void {
        this.config.value = { chips_model: 0, pingbi: {} };
        this.help.value = {};
    }
}
