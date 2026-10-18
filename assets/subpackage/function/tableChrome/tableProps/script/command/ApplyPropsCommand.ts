import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { NetworkSystem } from "../../../../../script/game/system/NetworkSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { ensureHallRegistered } from "../../../../hall/hallMenu/script/CarteModule";
import { HallPlayerModel } from "../../../../hall/hallMenu/script/model/HallPlayerModel";
import { ensureDeskRegistered } from "../../tableTheme/script/DeskModule";
import { DeskStyleChangedEvent } from "../../tableTheme/script/event/DeskStyleChangedEvent";
import { DeskStyleModel } from "../../tableTheme/script/model/DeskStyleModel";
import { PropsRoute, PropsExclusiveSkinCombo } from "../config/PropsConfig";
import type { PropsApplyReq, PropsApplyRes } from "../config/PropsProtocol";
import { PropsProfileChangedEvent } from "../event/PropsProfileChangedEvent";
import { ensurePropsRegistered } from "../PropsManageModule";
import { PropsManageModel } from "../model/PropsManageModel";

export class ApplyPropsCommand extends AbstractCommand {
    public constructor(private readonly body: PropsApplyReq) {
        super();
    }

    protected OnExecute(): void {
        ensurePropsRegistered();
        ensureDeskRegistered();
        const net = this.GetSystem(NetworkSystem);
        void net
            .callLobby<PropsApplyRes>(PropsRoute.Apply, this.body)
            .then((res) => {
                if (res.code !== 0 && res.code !== undefined) {
                    LogKit.W("[ApplyPropsCommand] code={0} msg={1}", res.code, res.message ?? "");
                    this.GetSystem(UISystem).showToast(res.message ?? "Save failed");
                    return;
                }
                const data = res.data;
                if (!data) {
                    return;
                }
                const equipped = data.equipped;
                if (equipped) {
                    const model = this.GetModel(DeskStyleModel);
                    const changed = model.applyServer(
                        equipped.table_id,
                        equipped.table_face_id,
                        equipped.table_back_id,
                    );
                    if (changed) {
                        model.persistLocal();
                        this.SendEvent(new DeskStyleChangedEvent());
                    }
                    const propsModel = this.GetModel(PropsManageModel);
                    const page = propsModel.page.value ?? {};
                    propsModel.page.value = { ...page, equipped };
                    propsModel.draftStyles = {
                        tableId: equipped.table_id ?? propsModel.draftStyles.tableId,
                        faceId: equipped.table_face_id ?? propsModel.draftStyles.faceId,
                        backId: equipped.table_back_id ?? propsModel.draftStyles.backId,
                    };
                    this.maybeExclusiveHint(equipped);
                }
                const prof = data.equipped_profile;
                if (prof) {
                    ensureHallRegistered();
                    const hall = this.GetModel(HallPlayerModel);
                    const cur = hall.player.value;
                    hall.apply({
                        ...cur,
                        name: prof.name ?? cur.name,
                        avatar: prof.avatar ?? cur.avatar,
                        avatar_url: prof.avatar_url ?? cur.avatar_url,
                    });
                    this.GetModel(PropsManageModel).mergeEquippedProfile(prof);
                    this.SendEvent(new PropsProfileChangedEvent(prof));
                }
                this.GetSystem(UISystem).showToast("Change successful");
            })
            .catch((err) => {
                LogKit.W("[ApplyPropsCommand] {0}", err instanceof Error ? err.message : String(err));
            });
    }

    private maybeExclusiveHint(equipped: { table_id?: number; table_face_id?: number; table_back_id?: number }): void {
        if (
            equipped.table_id === PropsExclusiveSkinCombo.tableId &&
            equipped.table_face_id === PropsExclusiveSkinCombo.faceId &&
            equipped.table_back_id === PropsExclusiveSkinCombo.backId
        ) {
            this.GetSystem(UISystem).showToast("Exclusive skin equipped");
        }
    }
}
