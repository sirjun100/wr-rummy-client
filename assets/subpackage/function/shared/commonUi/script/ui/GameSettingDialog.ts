import { _decorator, Node, sys } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { AudioKit } from "../../../../../script/framework/toolkits/audioKit/AudioKit";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioSystem, BgmContext } from "../../../../../script/game/system/AudioSystem";
import { ensureHallRegistered } from "../../../../hall/hallMenu/script/CarteModule";
import { SettingsPreferenceModel } from "../../../../hall/hallMenu/script/model/SettingsPreferenceModel";
import type { GameSettingUiData } from "../config/PublicProtocol";
import { applyLandscape, findNodeByName, wireButtonByName } from "../utility/PublicDialogUtil";

const { ccclass } = _decorator;

@ccclass("GameSettingDialog")
export class GameSettingDialog extends BaseDialog {
    protected OnInit(): void {
        ensureHallRegistered();
        const data = (this.uiData ?? {}) as GameSettingUiData;
        applyLandscape(this.node, data.landscape);
        wireButtonByName(this.node, "close", () => this.CloseSelf(), this);
        wireButtonByName(this.node, "close_big", () => this.CloseSelf(), this);
        this.bindToggle("item0", () => AudioKit.Settings.IsMusicOn.Value, (on) => {
            AudioKit.Settings.IsMusicOn.Value = on;
            sys.localStorage.setItem("bg_enabled", String(on));
            GameApp.Interface.GetSystem(AudioSystem).switchBgm(BgmContext.Room);
        });
        this.bindToggle("item1", () => AudioKit.Settings.IsSoundOn.Value, (on) => {
            AudioKit.Settings.IsSoundOn.Value = on;
            sys.localStorage.setItem("fx_enabled", String(on));
        });
        this.bindToggle("item2", () => GameApp.Interface.GetModel(SettingsPreferenceModel).getVibrationEnabled(), (on) => {
            GameApp.Interface.GetModel(SettingsPreferenceModel).setVibrationEnabled(on);
        });
    }

    private bindToggle(itemName: string, read: () => boolean, write: (on: boolean) => void): void {
        const item = findNodeByName(this.node, itemName);
        if (!item) {
            return;
        }
        const refresh = () => {
            const on = read();
            const sprite = findNodeByName(item, "Sprite");
            if (sprite) {
                sprite.setScale(on ? 1 : 1, on ? 1 : 1);
                sprite.active = on;
            }
        };
        refresh();
        item.off(Node.EventType.TOUCH_END);
        item.on(Node.EventType.TOUCH_END, () => {
            write(!read());
            refresh();
        });
    }

    protected OnClose(): void {}
}
