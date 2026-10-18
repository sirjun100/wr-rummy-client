import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { PaymentDialogId } from "../../../../../script/game/commerce/config/PaymentDialogId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import type { PersonBindOpenData } from "../config/VerifyProtocol";
import { ensureVerifyRegistered } from "../VerifyModule";
import { VerifyModel } from "../model/VerifyModel";
import { PersonMsgBindDialog } from "../ui/PersonMsgBindDialog";

export class OpenPersonBindDialogCommand extends AbstractCommand {
    public constructor(private readonly bindType: PersonBindOpenData = "tel") {
        super();
    }

    protected OnExecute(): void {
        ensureVerifyRegistered();
        this.GetModel(VerifyModel).activeBindType = this.bindType;
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        void this.GetSystem(UISystem).openDialogAsync(
            PersonMsgBindDialog,
            BundleKey.Kyc,
            PaymentDialogId.PersonMsgBindDialog,
            {
                uiData: this.bindType,
                level: UILevel.PopUI,
            },
        );
    }
}
