import { AbstractModel, BindableProperty } from "../../../../../script/framework/QFramework";
import type { ClubPageDto, PlayerClubDto, UpgradePopDto } from "../config/MembershipProtocol";

export class MembershipModel extends AbstractModel {
    public readonly page = new BindableProperty<ClubPageDto>({});
    public readonly playerClub = new BindableProperty<PlayerClubDto>({});
    public readonly pendingUpgrade = new BindableProperty<UpgradePopDto | null>(null);

    protected OnInit(): void {}

    public applyPage(dto: ClubPageDto): void {
        this.page.value = { ...dto };
        if (dto.player_club_info) {
            this.playerClub.value = { ...dto.player_club_info };
        }
    }

    public applyPlayerClub(dto: PlayerClubDto): void {
        this.playerClub.value = { ...dto };
        const cur = this.page.value;
        this.page.value = { ...cur, player_club_info: { ...dto } };
    }

    public clear(): void {
        this.page.value = {};
        this.playerClub.value = {};
        this.pendingUpgrade.value = null;
    }
}
