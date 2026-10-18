import { _decorator, EditBox, find, Node, tween, UITransform, v3 } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { ApplyPropsCommand } from "../command/ApplyPropsCommand";
import { PropsAvatarGridBinder } from "../controller/PropsAvatarGridBinder";
import { ensurePropsRegistered } from "../PropsManageModule";

const { ccclass, property } = _decorator;

@ccclass("PropsManageDialog")
export class PropsManageDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node | null = null;

    @property(PropsAvatarGridBinder)
    public avatarBinder: PropsAvatarGridBinder | null = null;

    private clickLock = 0;

    protected OnInit(): void {
        ensurePropsRegistered();
        this.resolveNodes();
        this.playEnterAnim();
        const binder = this.avatarBinder ?? this.node.getComponent(PropsAvatarGridBinder);
        if (binder) {
            binder.bind(() => this.refreshSaveState());
            this.avatarBinder = binder;
        }
        this.refreshSaveState();
    }

    private resolveNodes(): void {
        if (!this.rootNode) {
            this.rootNode = find("root", this.node);
        }
        if (!this.avatarBinder) {
            const display = find("root/display_node/avatar_root", this.node);
            const binder = this.node.getComponent(PropsAvatarGridBinder) ?? this.node.addComponent(PropsAvatarGridBinder);
            if (display) {
                binder.avatarRoot = display;
            }
            binder.itemTemplate = find("root/display_node/avatar_root/item", this.node);
            binder.saveBtn = find("root/save_btn", this.node);
            binder.nameEdit = find("root/edit_name", this.node)?.getComponent(EditBox) ?? null;
            this.avatarBinder = binder;
        }
    }

    private playEnterAnim(): void {
        if (!this.rootNode) {
            return;
        }
        const h = this.rootNode.getComponent(UITransform)?.contentSize.height ?? 1180;
        const target = v3(0, -h / 2, 0);
        this.rootNode.setPosition(v3(0, -1820, 0));
        tween(this.rootNode).to(0.15, { position: target }).start();
    }

    private refreshSaveState(): void {
        const draft = this.avatarBinder?.getDraft();
        this.avatarBinder?.setSaveEnabled(draft?.changed ?? false);
    }

    public onCloseClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.CloseSelf();
    }

    public onSaveClick(): void {
        const now = Date.now();
        if (now - this.clickLock < 1000) {
            return;
        }
        this.clickLock = now;
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        const draft = this.avatarBinder?.getDraft();
        if (!draft?.changed) {
            this.refreshSaveState();
            return;
        }
        this.avatarBinder?.setSaveEnabled(false);
        GameApp.Interface.SendCommand(
            new ApplyPropsCommand({
                name: draft.name,
                avatar_id: draft.avatarId,
            }),
        );
        this.scheduleOnce(() => this.CloseSelf(), 0.35);
    }

    public avatarChooseClick(event: unknown, custom: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        this.avatarBinder?.avatarChooseClick(event, custom);
    }

    public onEditBoxChanged(): void {
        this.avatarBinder?.onEditBoxChanged();
    }

    public onEditBoxEnded(): void {
        this.avatarBinder?.onEditBoxEnded();
    }
}
