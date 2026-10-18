import { _decorator, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import type { SharePopDto } from "../config/ShareConfig";
import { ShareModel } from "../model/ShareModel";
import { shareLinkCopy, shareWhatsApp } from "../utility/ShareActions";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { PlatformSystem } from "../../../../../script/game/system/PlatformSystem";
import { IUIData } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { runNextLobbyActivity } from "../utility/LobbyActivityQueue";

const { ccclass, property } = _decorator;

export type SharePopActUiData = IUIData & {
    payload?: SharePopDto;
};

@ccclass("SharePopAct")
export class SharePopActDialog extends BaseDialog {
    @property(Node)
    public rootNode: Node = null;

    private payload: SharePopDto = {};
    private lastClick = 0;
    private closed = false;

    protected OnInit(uiData: SharePopActUiData = null): void {
        if (uiData?.payload) {
            this.payload = uiData.payload;
        }
        this.rootNode = this.rootNode ?? this.node.getChildByName("root");
    }

    public onButtonClick(_e: unknown, custom: string): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
        if (custom === "close") {
            if (this.payload.isNext) {
                runNextLobbyActivity();
            }
            this.onBackView();
            return;
        }
        const model = GameApp.Interface.GetModel(ShareModel);
        const page = model.page.value;
        const shareUrl = this.payload.share_url ?? page?.share_url ?? "";
        const shareText = this.payload.share_text ?? page?.share_text ?? "";
        const platform = GameApp.Interface.GetSystem(PlatformSystem);
        const now = Date.now();
        if (custom === "whatsapp") {
            if (!platform.isPackageInstalled("com.whatsapp")) {
                shareLinkCopy(shareText, shareUrl);
                return;
            }
            if (now - this.lastClick < 500) {
                return;
            }
            this.lastClick = now;
            shareWhatsApp(shareText, shareUrl);
        } else if (custom === "link") {
            if (now - this.lastClick < 500) {
                return;
            }
            this.lastClick = now;
            shareLinkCopy(shareText, shareUrl);
        }
    }

    public onBackView(): void {
        if (this.closed) {
            return;
        }
        this.closed = true;
        this.CloseSelf();
    }
}
