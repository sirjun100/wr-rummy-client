import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { FetchFastBuyPageCommand } from "../../../../../script/game/commerce/command/FetchFastBuyPageCommand";
import type { FastBuyOpenData } from "../../../../../script/game/commerce/config/PaymentProtocol";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { FastBuyContext } from "../config/FastBuyConfig";
import { GameFastBuyDialog } from "../ui/GameFastBuyDialog";
import { HallFastBuyDialog } from "../ui/HallFastBuyDialog";

export class OpenFastBuyDialogCommand extends AbstractCommand {
    public constructor(private readonly openData: FastBuyOpenData) {
        super();
    }

    protected OnExecute(): void {
        const context = this.openData.context === "game" ? FastBuyContext.Game : FastBuyContext.Hall;
        this.SendCommand(
            new FetchFastBuyPageCommand(context, this.openData.vid, {
                inRoom: this.openData.inRoom,
                score: this.openData.minEntry,
            }),
        );
        const audio = this.GetSystem(AudioSystem);
        audio.playFx(AudioFxId.ActPopShow);
        const ui = this.GetSystem(UISystem);
        const isGame = this.openData.context === "game";
        const panel = isGame ? GameFastBuyDialog : HallFastBuyDialog;
        const prefab = isGame ? "GameFastBuyDialog" : "HallFastBuyDialog";
        void ui.openDialogAsync(panel, BundleKey.QuickRecharge, prefab, {
            uiData: this.openData,
            level: UILevel.PopUI,
        });
    }
}
