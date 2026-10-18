import { GameApp } from "../../../../../script/game/GameApp";
import { EnterSubGameCommand } from "../../../../../script/game/command/EnterSubGameCommand";
import { BundleKey, getManifestEntry, SubGameId } from "../../../../../script/game/config/BundleManifest";
import { LogKit } from "../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { GameplayContextModel } from "../../../../../script/game/model/GameplayContextModel";
import { BundleSystem } from "../../../../../script/game/system/BundleSystem";
import { HallActId } from "../config/LobbyConfig";

async function loadBundle(key: BundleKey): Promise<void> {
    const entry = getManifestEntry(key);
    await GameApp.Interface.GetSystem(BundleSystem).loadBundle(entry.bundleName);
}

export class HallActivityRouter {
    static async openByActId(actId: number, ext?: unknown): Promise<void> {
        switch (actId) {
            case HallActId.AdvancedGift:
                return HallActivityRouter.openAdvancedGift();
            case HallActId.BeginnerFlip:
                return HallActivityRouter.openBeginnerFlipTask();
            case HallActId.DailyCheckin:
                return HallActivityRouter.openDailyCheckin();
            case HallActId.DailyWork:
                return HallActivityRouter.openDailyWork();
            case HallActId.NewPlayerTask:
                return HallActivityRouter.openNewPlayerTask();
            case HallActId.WeeklyMonthCard:
                return HallActivityRouter.openWeeklyMonthCard();
            case HallActId.PiggyBank:
                return HallActivityRouter.openPiggyBank();
            case HallActId.FirstBuy:
                return HallActivityRouter.openFirstBuy();
            case HallActId.WholeDayGift:
                return HallActivityRouter.openWholeDayGift();
            case HallActId.RebateRecharge:
                return HallActivityRouter.openRebateRecharge();
            case HallActId.RestartGift:
                return HallActivityRouter.openRestartGift();
            case HallActId.ConsecutiveGift:
                return HallActivityRouter.openConsecutiveGift();
            case HallActId.CouponPackage:
                return HallActivityRouter.openCouponPackage(ext);
            case HallActId.PayOneForThree:
                return HallActivityRouter.openPayOneForThree();
            case HallActId.Earthquakes:
            case HallActId.EarthquakesChip:
                return HallActivityRouter.openEarthquakes(actId === HallActId.EarthquakesChip ? 1 : 0);
            case HallActId.Cricket:
                return HallActivityRouter.enterCricket();
            case HallActId.Sixpoint:
                return HallActivityRouter.enterSixpoint();
            case HallActId.Rocket:
                return HallActivityRouter.enterRocket();
            default:
                LogKit.W("[HallActivityRouter] unmapped act_id={0}", actId);
        }
    }

    static async openAdvancedGift(): Promise<void> {
        try {
            await loadBundle(BundleKey.AdvancedGift);
            const mod = await import("../../../../activity/advancedGift/script/AdvancedGiftModule");
            await mod.openAdvancedGiftDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openAdvancedGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openBeginnerFlipTask(): Promise<void> {
        try {
            await loadBundle(BundleKey.BeginnerFlipTask);
            const mod = await import("../../../../activity/beginnerFlipTask/script/BeginnerFlipTaskModule");
            await mod.openBeginnerFlipTaskDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openBeginnerFlipTask {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openDailyCheckin(): Promise<void> {
        try {
            await loadBundle(BundleKey.DailyCheckin);
            const mod = await import("../../../../activity/dailycheckin/script/DailyCheckinModule");
            await mod.openDailyCheckinDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openDailyCheckin {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openDailyWork(): Promise<void> {
        try {
            await loadBundle(BundleKey.DailyWork);
            const mod = await import("../../../../activity/dailyWork/script/DailyWorkModule");
            await mod.openWelcomeBackWorkDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openDailyWork {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openNewPlayerTask(): Promise<void> {
        try {
            await loadBundle(BundleKey.NewPlayerTask);
            const mod = await import("../../../../activity/newPlayerTask/script/NewPlayerTaskModule");
            await mod.openNewPlayerTaskDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openNewPlayerTask {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openWeeklyMonthCard(): Promise<void> {
        try {
            await loadBundle(BundleKey.WeeklyMonthCard);
            const mod = await import("../../../../activity/weeklymonthcard/script/WeeklyMonthCardModule");
            await mod.openWeeklyMonthCardDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openWeeklyMonthCard {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openPiggyBank(): Promise<void> {
        try {
            await loadBundle(BundleKey.PiggyBank);
            const mod = await import("../../../../activity/piggy_bank/script/PiggyBankModule");
            await mod.openPiggyBankDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openPiggyBank {0}", err instanceof Error ? err.message : String(err));
        }
    }

    private static async loadRechargeEventMod(): Promise<typeof import("../../../../activity/rechargeEvent/script/RechargeEventModule")> {
        await loadBundle(BundleKey.RechargeEvent);
        return import("../../../../activity/rechargeEvent/script/RechargeEventModule");
    }

    static async openFirstBuy(): Promise<void> {
        try {
            const mod = await HallActivityRouter.loadRechargeEventMod();
            await mod.openFirstBuyDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openFirstBuy {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openWholeDayGift(): Promise<void> {
        try {
            const mod = await HallActivityRouter.loadRechargeEventMod();
            await mod.openWholeDayGiftDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openWholeDayGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openRebateRecharge(): Promise<void> {
        try {
            const mod = await HallActivityRouter.loadRechargeEventMod();
            await mod.openRebateRechargeDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openRebateRecharge {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openRestartGift(): Promise<void> {
        try {
            const mod = await HallActivityRouter.loadRechargeEventMod();
            await mod.openRestartGiftDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openRestartGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openConsecutiveGift(): Promise<void> {
        try {
            const mod = await HallActivityRouter.loadRechargeEventMod();
            await mod.openConsecutiveGiftDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openConsecutiveGift {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openCouponPackage(ext?: unknown): Promise<void> {
        try {
            const mod = await HallActivityRouter.loadRechargeEventMod();
            await mod.openCouponPackageDialog(
                ext as import("../../../../activity/rechargeEvent/script/config/RechargeEventConfig").CouponPackageDto,
            );
        } catch (err) {
            LogKit.E("[HallActivityRouter] openCouponPackage {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openPayOneForThree(): Promise<void> {
        try {
            await loadBundle(BundleKey.PayOneForThree);
            const mod = await import("../../../../activity/payoneforthree/script/PayOneForThreeModule");
            await mod.openPayOneForThreeDialog();
        } catch (err) {
            LogKit.E("[HallActivityRouter] openPayOneForThree {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static async openEarthquakes(chip: 0 | 1 = 0): Promise<void> {
        try {
            await loadBundle(BundleKey.Earthquakes);
            const mod = await import("../../../../activity/earthquakes/script/EarthquakesModule");
            const { EarthquakesOpenData } = await import(
                "../../../../activity/earthquakes/script/config/EarthquakesConfig"
            );
            await mod.openEarthquakesDialog(new EarthquakesOpenData(1, 0, chip, false));
        } catch (err) {
            LogKit.E("[HallActivityRouter] openEarthquakes {0}", err instanceof Error ? err.message : String(err));
        }
    }

    static enterCricket(): void {
        GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Cricket));
    }

    static enterSixpoint(): void {
        void import("../../../../games/bet/sixpoint/script/SixpointGameModule")
            .then((mod) => {
                mod.ensureSixpointRegistered();
                return import("../../../../games/bet/sixpoint/script/model/SixpointModel");
            })
            .then((sm) => {
                if (!sm) {
                    return;
                }
                const m = GameApp.Interface.GetModel(sm.SixpointModel);
                m.templateId = "default";
                m.vid = 146;
            })
            .catch(() => undefined);
        GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Sixpoint));
    }

    static enterRocket(): void {
        void import("../../../../games/bet/rocket/script/RocketGameModule")
            .then((mod) => {
                mod.ensureRocketRegistered();
                return import("../../../../games/bet/rocket/script/model/RocketModel");
            })
            .then((rm) => {
                if (!rm) {
                    return;
                }
                const m = GameApp.Interface.GetModel(rm.RocketModel);
                m.templateId = "default";
                m.vid = 144;
            })
            .catch(() => undefined);
        GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Rocket));
    }

    static enterRummy(templateId = "points_10", vid = 1): void {
        const ctx = GameApp.Interface.GetModel(GameplayContextModel);
        ctx.templateId = templateId;
        void import("../../../../games/poker/rummy/script/RummyGameModule")
            .then((mod) => {
                mod.ensureRummyRegistered();
                return import("../../../../games/poker/rummy/script/model/RummyModel");
            })
            .then((sm) => {
                if (!sm) {
                    return;
                }
                const m = GameApp.Interface.GetModel(sm.RummyModel);
                m.templateId = templateId;
                m.vid = vid;
            })
            .catch(() => undefined);
        GameApp.Interface.SendCommand(new EnterSubGameCommand(SubGameId.Rummy));
    }
}
