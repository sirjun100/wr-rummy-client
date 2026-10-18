import { AbstractCommand } from "../../../../../script/framework/QFramework";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../../script/game/config/BundleManifest";
import { PaymentDialogId } from "../../../../../script/game/commerce/config/PaymentDialogId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { UILevel } from "../../../../../script/framework/toolkits/uiKit/UIKit";
import { ensureVerifyRegistered } from "../VerifyModule";
import { KycPhotoDialog } from "../ui/KycPhotoDialog";

export class OpenKycDialogCommand extends AbstractCommand {
    protected OnExecute(): void {
        ensureVerifyRegistered();
        this.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
        void this.GetSystem(UISystem).openDialogAsync(KycPhotoDialog, BundleKey.Kyc, PaymentDialogId.KycPhoto, {
            uiData: {},
            level: UILevel.PopUI,
        });
    }
}
