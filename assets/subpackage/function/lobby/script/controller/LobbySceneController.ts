import { _decorator } from "cc";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { BundleKey, getManifestEntry, SubGameId } from "../../../../../script/game/config/BundleManifest";
import { BaseController } from "../../../../../script/game/controller/engine/BaseController";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";

const { ccclass } = _decorator;

@ccclass("LobbySceneController")
export class LobbySceneController extends BaseController {
    protected onLoad(): void {
        LogKit.I("[LobbySceneController] onLoad");
    }

    /** 供大厅按钮绑定：进入 Rummy */
    public enterRummy(): void {
        this.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
    }

    /** 供大厅按钮绑定：进阶礼包（Act_74） */
    public async openAdvancedGift(): Promise<void> {
        const entry = getManifestEntry(BundleKey.AdvancedGift);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/advancedGift/script/AdvancedGiftModule");
            await mod.openAdvancedGiftDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openAdvancedGift {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供大厅按钮绑定：新手翻牌任务（Act_123） */
    public async openBeginnerFlipTask(): Promise<void> {
        const entry = getManifestEntry(BundleKey.BeginnerFlipTask);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/beginnerFlipTask/script/BeginnerFlipTaskModule");
            await mod.openBeginnerFlipTaskDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openBeginnerFlipTask {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供大厅按钮绑定：每日签到（Act_107） */
    public async openDailyCheckin(): Promise<void> {
        const entry = getManifestEntry(BundleKey.DailyCheckin);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/dailycheckin/script/DailyCheckinModule");
            await mod.openDailyCheckinDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openDailyCheckin {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供大厅按钮绑定：回归翻牌任务（Act_86） */
    public async openDailyWork(): Promise<void> {
        const entry = getManifestEntry(BundleKey.DailyWork);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/dailyWork/script/DailyWorkModule");
            await mod.openWelcomeBackWorkDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openDailyWork {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供大厅按钮绑定：新手任务（Act_106） */
    public async openNewPlayerTask(): Promise<void> {
        const entry = getManifestEntry(BundleKey.NewPlayerTask);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/newPlayerTask/script/NewPlayerTaskModule");
            await mod.openNewPlayerTaskDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openNewPlayerTask {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 周月卡超值礼（Act_104） */
    public async openWeeklyMonthCard(): Promise<void> {
        const entry = getManifestEntry(BundleKey.WeeklyMonthCard);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/weeklymonthcard/script/WeeklyMonthCardModule");
            await mod.openWeeklyMonthCardDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openWeeklyMonthCard {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供大厅按钮绑定：存钱罐（Act_68 / Gullak） */
    public async openPiggyBank(): Promise<void> {
        const entry = getManifestEntry(BundleKey.PiggyBank);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/piggy_bank/script/PiggyBankModule");
            await mod.openPiggyBankDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openPiggyBank {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private async loadRechargeEventMod(): Promise<typeof import("../../../../activity/rechargeEvent/script/RechargeEventModule")> {
        const entry = getManifestEntry(BundleKey.RechargeEvent);
        await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
        return import("../../../../activity/rechargeEvent/script/RechargeEventModule");
    }

    /** 首充 SCLB（Act_54） */
    public async openFirstBuy(): Promise<void> {
        try {
            const mod = await this.loadRechargeEventMod();
            await mod.openFirstBuyDialog();
        } catch (err) {
            LogKit.E("[LobbySceneController] openFirstBuy {0}", err instanceof Error ? err.message : String(err));
        }
    }

    /** 24h 礼（Act_119） */
    public async openWholeDayGift(): Promise<void> {
        try {
            const mod = await this.loadRechargeEventMod();
            await mod.openWholeDayGiftDialog();
        } catch (err) {
            LogKit.E("[LobbySceneController] openWholeDayGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    /** 返利首充（Act_118） */
    public async openRebateRecharge(): Promise<void> {
        try {
            const mod = await this.loadRechargeEventMod();
            await mod.openRebateRechargeDialog();
        } catch (err) {
            LogKit.E("[LobbySceneController] openRebateRecharge {0}", err instanceof Error ? err.message : String(err));
        }
    }

    /** 回归礼（Act_124） */
    public async openRestartGift(): Promise<void> {
        try {
            const mod = await this.loadRechargeEventMod();
            await mod.openRestartGiftDialog();
        } catch (err) {
            LogKit.E("[LobbySceneController] openRestartGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    /** 连充礼（Act_130） */
    public async openConsecutiveGift(): Promise<void> {
        try {
            const mod = await this.loadRechargeEventMod();
            await mod.openConsecutiveGiftDialog();
        } catch (err) {
            LogKit.E("[LobbySceneController] openConsecutiveGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    /** 优惠券弹窗（Act_140） */
    public async openCouponPackage(ext?: unknown): Promise<void> {
        try {
            const mod = await this.loadRechargeEventMod();
            await mod.openCouponPackageDialog(ext as import("../../../../activity/rechargeEvent/script/config/RechargeEventConfig").CouponPackageDto);
        } catch (err) {
            LogKit.E("[LobbySceneController] openCouponPackage {0}", err instanceof Error ? err.message : String(err));
        }
    }

    /** 供大厅按钮绑定：买一得三（Act_125） */
    public async openPayOneForThree(): Promise<void> {
        const entry = getManifestEntry(BundleKey.PayOneForThree);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/payoneforthree/script/PayOneForThreeModule");
            await mod.openPayOneForThreeDialog();
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openPayOneForThree {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供大厅按钮绑定：寻宝活动（Act_90 / Act_97） */
    public async openEarthquakes(chip: 0 | 1 = 0): Promise<void> {
        const entry = getManifestEntry(BundleKey.Earthquakes);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../activity/earthquakes/script/EarthquakesModule");
            const { EarthquakesOpenData } = await import(
                "../../../../activity/earthquakes/script/config/EarthquakesConfig"
            );
            await mod.openEarthquakesDialog(new EarthquakesOpenData(1, 0, chip, false));
        } catch (err) {
            LogKit.E(
                "[LobbySceneController] openEarthquakes {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }
}
