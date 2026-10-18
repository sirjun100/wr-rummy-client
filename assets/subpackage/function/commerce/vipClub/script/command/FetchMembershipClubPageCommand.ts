import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { MembershipRoute } from "../config/MembershipConfig";
import type { ClubPageRes } from "../config/MembershipProtocol";
import { MembershipModel } from "../model/MembershipModel";
import { syncPaymentMembershipSummary } from "../utility/MembershipSummarySync";

export class FetchMembershipClubPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        void this.GetSystem(NetworkSystem)
            .callLobby<ClubPageRes>(MembershipRoute.ClubPage, {})
            .then((res) => {
                if (res?.data) {
                    this.GetModel(MembershipModel).applyPage(res.data);
                    syncPaymentMembershipSummary(res.data);
                }
            })
            .catch((err) => {
                LogKit.W("[FetchMembershipClubPageCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
