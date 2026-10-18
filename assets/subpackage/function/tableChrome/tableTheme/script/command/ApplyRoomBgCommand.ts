import { Sprite, UITransform, v3 } from "cc";
import { AbstractCommand } from "../../../../../script/framework/QFramework";
import type { DeskSkinTargets } from "../config/DeskConfig";
import { DeskStyleModel } from "../model/DeskStyleModel";
import {
    applySpriteToNode,
    loadDeskSpriteFrame,
    pickEmbeddedFrame,
} from "../utility/DeskSkinLoader";
import { resolveDeskSkinPlan, resolveMatchPreviewPlan } from "../utility/DeskSkinResolver";
import type { RoomBgBinder } from "../ui/RoomBgBinder";

export type ApplyRoomBgOptions = {
    binder?: RoomBgBinder;
    targets?: DeskSkinTargets;
    matchPreview?: boolean;
};

export class ApplyRoomBgCommand extends AbstractCommand {
    public constructor(private readonly options: ApplyRoomBgOptions) {
        super();
    }

    protected OnExecute(): void {
        void this.applyAsync();
    }

    private async applyAsync(): Promise<void> {
        const targets = this.options.targets ?? this.options.binder?.toTargets();
        if (!targets?.roomBg?.isValid) {
            return;
        }

        const model = this.GetModel(DeskStyleModel);
        const tableStyle = model.styles.value[0];
        const plan = this.options.matchPreview
            ? resolveMatchPreviewPlan()
            : resolveDeskSkinPlan(tableStyle, targets.context);

        const { roomBg, desk } = targets;

        if (plan.otherGameIndex !== undefined) {
            const roomFrame = pickEmbeddedFrame(targets.otherTableBg, plan.otherGameIndex);
            const deskFrame = pickEmbeddedFrame(targets.otherDeskBg, plan.otherGameIndex);
            if (roomFrame) {
                await applySpriteToNode(roomBg, roomFrame);
            }
            if (desk) {
                desk.active = !plan.hideDesk;
                if (plan.hideDesk) {
                    return;
                }
                if (deskFrame) {
                    await applySpriteToNode(desk, deskFrame);
                }
                const sprite = desk.getComponent(Sprite);
                if (sprite) {
                    sprite.sizeMode = Sprite.SizeMode.CUSTOM;
                }
                if (plan.deskPositionY !== undefined) {
                    desk.setPosition(v3(0, plan.deskPositionY, 0));
                }
            }
            return;
        }

        if (desk) {
            desk.active = !plan.hideDesk;
        }

        let deskFrame = plan.useFourDeskEmbedded
            ? pickEmbeddedFrame(targets.fourDeskBgs, plan.deskEmbeddedIndex ?? 0)
            : pickEmbeddedFrame(targets.deskBg, plan.deskEmbeddedIndex);
        if (!deskFrame && plan.deskEmbeddedFallbackIndex !== undefined) {
            deskFrame = pickEmbeddedFrame(targets.deskBg, plan.deskEmbeddedFallbackIndex);
        }
        if (plan.deskRemoteName) {
            const remote = await loadDeskSpriteFrame(plan.deskRemoteName);
            deskFrame = remote ?? deskFrame;
        }
        if (desk && deskFrame) {
            await applySpriteToNode(desk, deskFrame);
        }

        let roomFrame = pickEmbeddedFrame(targets.tableBg, plan.roomEmbeddedIndex);
        if (plan.roomRemoteName) {
            const remote = await loadDeskSpriteFrame(plan.roomRemoteName);
            roomFrame = remote ?? roomFrame;
        }
        if (roomFrame) {
            await applySpriteToNode(roomBg, roomFrame);
        }

        const ui = roomBg.getComponent(UITransform);
        if (ui && targets.context.scene === "hall") {
            /* size already set in scene */
        }
    }
}
