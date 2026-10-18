import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { WalletModel } from "../../model/WalletModel";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PlatformSystem } from "../../system/PlatformSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { ConfirmOrderRes, CreateOrderRes } from "../config/PaymentProtocol";
import { ShopRechargeFailedEvent, ShopRechargeSuccessEvent } from "../event/PaymentEvents";
import { FetchWalletSnapshotCommand } from "./FetchWalletSnapshotCommand";

export class StartShopPurchaseCommand extends AbstractCommand {
    public constructor(
        private readonly skuId: number,
        private readonly channelId: number,
        private readonly scene: number,
        private readonly vid: number,
        private readonly fastBuy: boolean,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        const clientOrderId = `co-${Date.now()}-${this.skuId}`;
        void net
            .callLobby<CreateOrderRes>(PaymentRoute.CreateOrder, {
                sku_id: this.skuId,
                channel_id: this.channelId,
                scene: this.scene,
                vid: this.vid,
                client_order_id: clientOrderId,
                fast_buy: this.fastBuy ? 1 : 0,
            })
            .then((res) => {
                const data = res.data;
                if (!data?.recharge_id) {
                    throw new Error("create order failed");
                }
                const platform = this.GetSystem(PlatformSystem);
                return platform
                    .startShopPay({
                        rechargeId: data.recharge_id,
                        money: data.price ?? 0,
                        channel: this.channelId,
                        testPay: data.test_pay ?? true,
                    })
                    .then(() =>
                        net.callLobby<ConfirmOrderRes>(PaymentRoute.ConfirmOrder, {
                            recharge_id: data.recharge_id,
                            psp_tx_id: "client-test",
                        }),
                    );
            })
            .then((confirm) => {
                if (confirm.data?.wallet) {
                    this.GetModel(WalletModel).apply(confirm.data.wallet);
                }
                this.SendCommand(new FetchWalletSnapshotCommand());
                this.SendEvent(new ShopRechargeSuccessEvent(confirm.data?.wallet));
            })
            .catch((err) => {
                const msg = err instanceof Error ? err.message : String(err);
                LogKit.W("[StartShopPurchaseCommand] {0}", msg);
                this.SendEvent(new ShopRechargeFailedEvent(msg));
            });
    }
}
