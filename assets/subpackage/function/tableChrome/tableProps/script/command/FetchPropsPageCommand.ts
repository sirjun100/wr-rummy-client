import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { ensureDeskRegistered } from "../../tableTheme/script/DeskModule";
import { DeskStyleChangedEvent } from "../../tableTheme/script/event/DeskStyleChangedEvent";
import { DeskStyleModel } from "../../tableTheme/script/model/DeskStyleModel";
import { PropsRoute } from "../config/PropsConfig";
import type { PropsPageRes } from "../config/PropsProtocol";
import { PropsTableRedDotChangedEvent } from "../event/PropsTableRedDotChangedEvent";
import { ensurePropsRegistered } from "../PropsManageModule";
import { PropsManageModel } from "../model/PropsManageModel";

export class FetchPropsPageCommand extends AbstractCommand {
    protected OnExecute(): void {
        ensurePropsRegistered();
        ensureDeskRegistered();
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PropsPageRes>(PropsRoute.Page, {})
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[FetchPropsPageCommand] code={0}", res.code);
                    return;
                }
                const data = res.data;
                if (!data) {
                    return;
                }
                const model = this.GetModel(PropsManageModel);
                model.applyPage(data);
                if (data.table_red_dot !== undefined) {
                    this.SendEvent(new PropsTableRedDotChangedEvent(data.table_red_dot));
                }
                const equipped = data.equipped;
                if (!equipped) {
                    return;
                }
                const desk = this.GetModel(DeskStyleModel);
                const changed = desk.applyServer(
                    equipped.table_id,
                    equipped.table_face_id,
                    equipped.table_back_id,
                );
                if (changed) {
                    desk.persistLocal();
                    this.SendEvent(new DeskStyleChangedEvent());
                }
            })
            .catch((err) => {
                LogKit.W("[FetchPropsPageCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }
}
