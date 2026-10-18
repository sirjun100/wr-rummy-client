import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { ShopListRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export class FetchShopListCommand extends AbstractCommand {
    public constructor(private readonly exeJson: string = "") {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<ShopListRes>(PaymentRoute.ShopList, { exe: this.exeJson })
            .then((res) => {
                if (res.shop_data) {
                    this.GetModel(PaymentModel).shopPage.value = res.shop_data;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchShopListCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
