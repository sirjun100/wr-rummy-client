import { AbstractCommand } from "../../../../../script/framework/QFramework";
import type { PlayerClubDto } from "../config/MembershipProtocol";
import { MembershipModel } from "../model/MembershipModel";
import { syncPaymentMembershipSummary, syncPaymentSummaryFromPlayerClub } from "../utility/MembershipSummarySync";

export class ApplyMembershipPlayerClubCommand extends AbstractCommand {
    private readonly dto: PlayerClubDto;

    public constructor(dto: PlayerClubDto) {
        super();
        this.dto = dto;
    }

    protected OnExecute(): void {
        const model = this.GetModel(MembershipModel);
        model.applyPlayerClub(this.dto);
        if ((model.page.value.list?.length ?? 0) > 0) {
            syncPaymentMembershipSummary(model.page.value);
        } else {
            syncPaymentSummaryFromPlayerClub(this.dto);
        }
    }
}
