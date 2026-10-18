import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { SessionModel } from "../../../../../script/game/model/SessionModel";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { StartLoginFlowCommand } from "../../../../../script/game/command/StartLoginFlowCommand";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { HallRoute, type CodeRes } from "../config/HallConfig";
import { HallConfigModel } from "../model/HallConfigModel";
import { HallPlayerModel } from "../model/HallPlayerModel";
export class LogoutCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<CodeRes>(HallRoute.Logout, {})
            .catch((err) => {
                LogKit.W("[LogoutCommand] server logout {0}", err instanceof Error ? err.message : String(err));
            })
            .finally(() => {
                net.disconnect();
                this.GetModel(SessionModel).clear();
                this.GetModel(WalletModel).clear();
                this.GetModel(HallPlayerModel).clear();
                this.GetModel(HallConfigModel).clear();
                void import("../../../../social/inviteShare/script/CommShareModule").then((m) =>
                    m.clearShareModelIfRegistered(),
                );
                void this.GetSystem(BundleSystem)
                    .goMain()
                    .finally(() => {
                        this.SendCommand(new StartLoginFlowCommand());
                    });
            });
    }
}
