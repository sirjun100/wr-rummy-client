import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import type { CodeRes } from "../config/PaymentProtocol";

export class AckShopRetainCommand extends AbstractCommand {
    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<CodeRes>(PaymentRoute.ShopRetainAck, {})
            .catch((err) => {
                LogKit.W("[AckShopRetainCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
