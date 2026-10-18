import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { PropsRoute } from "../config/PropsConfig";
import type { PropsCodeRes } from "../config/PropsProtocol";
import { PropsTableRedDotChangedEvent } from "../event/PropsTableRedDotChangedEvent";
import { ensurePropsRegistered } from "../PropsManageModule";
import { PropsManageModel } from "../model/PropsManageModel";

export class ClearTableRedDotCommand extends AbstractCommand {
    protected OnExecute(): void {
        ensurePropsRegistered();
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PropsCodeRes>(PropsRoute.ClearTableRedDot, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[ClearTableRedDotCommand] code={0}", res.code);
                    return;
                }
                const model = this.GetModel(PropsManageModel);
                model.tableRedDot.value = 0;
                this.SendEvent(new PropsTableRedDotChangedEvent(0));
            })
            .catch((err) => {
                LogKit.W("[ClearTableRedDotCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
