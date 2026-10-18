import { AbstractCommand } from "../../framework/QFramework";
import { LogKit } from "../../framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../system/NetworkSystem";
import { PaymentRoute } from "../config/PaymentRoute";
import { FastBuyRes } from "../config/PaymentProtocol";
import { PaymentModel } from "../model/PaymentModel";

export type FetchFastBuyExtras = {
    inRoom?: number;
    score?: number;
};

export class FetchFastBuyPageCommand extends AbstractCommand {
    public constructor(
        private readonly context: string,
        private readonly vid: number,
        private readonly extras?: FetchFastBuyExtras,
    ) {
        super();
    }

    protected OnExecute(): void {
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<FastBuyRes>(PaymentRoute.FastBuyPage, {
                context: this.context,
                vid: this.vid,
                in_room: this.extras?.inRoom,
                score: this.extras?.score,
            })
            .then((res) => {
                if (res.data) {
                    this.GetModel(PaymentModel).fastBuyPage.value = res.data;
                }
            })
            .catch((err) => {
                LogKit.W("[FetchFastBuyPageCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
