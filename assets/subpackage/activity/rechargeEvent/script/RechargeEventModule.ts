import { GameApp } from "../../../../script/game/GameApp";
import { AudioFxId } from "../../../../script/game/config/AudioFxId";
import { BundleKey } from "../../../../script/game/config/BundleManifest";
import { AudioSystem } from "../../../../script/game/system/AudioSystem";
import { UISystem } from "../../../../script/game/system/UISystem";
import { UILevel } from "../../../../script/framework/toolkits/uiKit/UIKit";
import { CouponPackageDto, RechargeOpenData } from "./config/RechargeEventConfig";
import { FirstBuyModel } from "./model/FirstBuyModel";
import { WholeDayModel } from "./model/WholeDayModel";
import { RestartGiftModel } from "./model/RestartGiftModel";
import { RebateModel } from "./model/RebateModel";
import { ConsecutiveModel } from "./model/ConsecutiveModel";
import { FirstBuyUtility } from "./utility/FirstBuyUtility";
import { WholeDayUtility } from "./utility/WholeDayUtility";
import { RestartGiftUtility } from "./utility/RestartGiftUtility";
import { RebateUtility } from "./utility/RebateUtility";
import { ConsecutiveUtility } from "./utility/ConsecutiveUtility";
import { FirstBuyDialog } from "./ui/FirstBuyDialog";
import { WholeDayGiftDialog } from "./ui/WholeDayGiftDialog";
import { SuperValueGiftDialog } from "./ui/SuperValueGiftDialog";
import { RebateRechargeDialog } from "./ui/RebateRechargeDialog";
import { EndlessBenefitsGiftDialog } from "./ui/EndlessBenefitsGiftDialog";
import { CouponPackageDialog } from "./ui/CouponPackageDialog";

let registered = false;

export function ensureRechargeEventRegistered(): void {
    if (registered) {
        return;
    }
    GameApp.Interface.RegisterModel(new FirstBuyModel());
    GameApp.Interface.RegisterModel(new WholeDayModel());
    GameApp.Interface.RegisterModel(new RestartGiftModel());
    GameApp.Interface.RegisterModel(new RebateModel());
    GameApp.Interface.RegisterModel(new ConsecutiveModel());
    GameApp.Interface.RegisterUtility(new FirstBuyUtility());
    GameApp.Interface.RegisterUtility(new WholeDayUtility());
    GameApp.Interface.RegisterUtility(new RestartGiftUtility());
    GameApp.Interface.RegisterUtility(new RebateUtility());
    GameApp.Interface.RegisterUtility(new ConsecutiveUtility());
    registered = true;
}

async function openDialog(
    dialogClass: new () => unknown,
    prefab: string,
    uiData?: RechargeOpenData,
): Promise<void> {
    ensureRechargeEventRegistered();
    GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.ActPopShow);
    const ui = GameApp.Interface.GetSystem(UISystem);
    await ui.openDialogAsync(dialogClass as never, BundleKey.RechargeEvent, prefab, {
        uiData: uiData ?? new RechargeOpenData(),
        level: UILevel.PopUI,
    });
}

export async function openFirstBuyDialog(uiData?: RechargeOpenData): Promise<void> {
    ensureRechargeEventRegistered();
    const page = GameApp.Interface.GetModel(FirstBuyModel).page.value;
    const prefab =
        uiData?.prefabKey ??
        GameApp.Interface.GetUtility(FirstBuyUtility).resolvePrefabName(page, uiData?.inRoom ?? false);
    await openDialog(FirstBuyDialog, prefab, uiData);
}

export async function openWholeDayGiftDialog(uiData?: RechargeOpenData): Promise<void> {
    await openDialog(WholeDayGiftDialog, "WholeDayGiftDialog", uiData);
}

export async function openRestartGiftDialog(uiData?: RechargeOpenData): Promise<void> {
    const prefab = uiData?.inRoom ? "SuperValueGiftGameDialog" : "SuperValueGiftDialog";
    await openDialog(SuperValueGiftDialog, prefab, uiData);
}

export async function openRebateRechargeDialog(uiData?: RechargeOpenData): Promise<void> {
    const prefab = uiData?.inRoom ? "RebateRechargeGameDialog" : "RebateRechargeDialog";
    await openDialog(RebateRechargeDialog, prefab, uiData);
}

export async function openConsecutiveGiftDialog(uiData?: RechargeOpenData): Promise<void> {
    const prefab = uiData?.inRoom ? "EndlessBenefitsGiftGameDialog" : "EndlessBenefitsGiftDialog";
    await openDialog(EndlessBenefitsGiftDialog, prefab, uiData);
}

export async function openCouponPackageDialog(
    ext?: CouponPackageDto,
    uiData?: RechargeOpenData,
): Promise<void> {
    const data = uiData ?? new RechargeOpenData(0, false, false, undefined, ext);
    if (ext && !data.initialExt) {
        data.initialExt = ext;
    }
    const prefab = data.inRoom ? "CouponPackageGameDialog" : "CouponPackageDialog";
    await openDialog(CouponPackageDialog, prefab, data);
}
