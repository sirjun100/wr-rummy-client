import { _decorator, Button, find, game, Game, Label, Node, Sprite } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { BundleKey, getManifestEntry } from "../../../../../../script/game/config/BundleManifest";
import { HallConfigModel } from "../../../../function/hall/hallMenu/script/model/HallConfigModel";
import { BaseController } from "../../../../../../script/game/controller/engine/BaseController";
import { GameplayContextModel } from "../../../../../../script/game/model/GameplayContextModel";
import { BundleSystem } from "../../../../../../script/game/system/BundleSystem";
import { LogKit } from "../../../../../../script/framework/toolkits/coreKit/logKit/LogKit";
import { RummyEnterRoomCommand } from "../command/RummyEnterRoomCommand";
import { RummyRejoinCommand } from "../command/RummyRejoinCommand";
import { RummySubscribePushCommand } from "../command/RummySubscribePushCommand";
import { RummySyncTableCommand } from "../command/RummySyncTableCommand";
import { RummyVidTemplate } from "../config/RummyProtocol";
import { RummyModel } from "../model/RummyModel";
import { ensureRummyRegistered } from "../RummyGameModule";
import { RummyRoomBgBinder } from "../ui/RummyRoomBgBinder";
import { ensureDeskRegistered } from "../../../../function/tableChrome/tableTheme/script/DeskModule";
import { DeskStyleChangedEvent } from "../../../../function/tableChrome/tableTheme/script/event/DeskStyleChangedEvent";
import { ApplyRummyCardDisplayCommand } from "../command/ApplyRummyCardDisplayCommand";

const { ccclass, property } = _decorator;

@ccclass("RummyGameSceneController")
export class RummyGameSceneController extends BaseController {
    /** 桌台 vid，可在编辑器覆盖；未配置时 P0 使用 1 */
    public tableVid = 1;

    @property(Node)
    public novicesTaskBtn: Node = null;

    @property(Node)
    public gullakBtn: Node = null;

    private backgroundAt = 0;

    protected onLoad(): void {
        LogKit.I("[RummyGameSceneController] onLoad");
        ensureRummyRegistered();
        ensureDeskRegistered();
        if (!this.node.getComponent(RummyRoomBgBinder)) {
            this.node.addComponent(RummyRoomBgBinder);
        }
        this.SendCommand(new RummySubscribePushCommand());
        const ctx = this.GetModel(GameplayContextModel);
        const model = this.GetModel(RummyModel);
        model.vid = this.tableVid;
        model.templateId = ctx.templateId || RummyVidTemplate[this.tableVid] || "points_10";
        ctx.templateId = model.templateId;
        this.SendCommand(new RummyEnterRoomCommand());
        game.on(Game.EVENT_SHOW, this.onForeground, this);
        game.on(Game.EVENT_HIDE, this.onBackground, this);
        void import("../../../../function/tableChrome/networkOverlay/script/NetworkDelayModule").then((m) => {
            m.ensureNetworkDelayRegistered();
            m.attachNetworkDelayOverlay();
        });
        void this.wireNetSignalBinder();
        void this.checkBeginnerFlipReward();
        void this.checkEarthquakesChipReward();
        void this.checkNovicesTask();
        void this.checkGullakHud();
        void this.checkChallengerLeaderboard();
        GameApp.Interface.RegisterEvent(DeskStyleChangedEvent, () => {
            this.SendCommand(new ApplyRummyCardDisplayCommand());
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    /** Prefab menu customEventData `gamedisplay` → in-room table/card skins. */
    public onGameDisplayClick(): void {
        void import("../../../../function/tableChrome/tableProps/script/PropsManageModule").then((m) => m.openPropsRoomDialog());
    }

    /** Prefab menu customEventData `set` → BGM / FX / vibration. */
    public onGameSettingClick(): void {
        void import("../../../../function/shared/commonUi/script/PublicModule").then((m) => {
            m.openGameSetting({ landscape: true });
        });
    }

    /** Prefab `rule_btn` / help → in-room How to Play (hall rules UI, landscape). */
    public onRulesHelpClick(): void {
        const model = this.GetModel(RummyModel);
        const hall = this.GetModel(HallConfigModel);
        void import("../../../../function/tableChrome/gameRules/script/RegularModule").then((m) => {
            m.openRummyInGameRules({
                templateId: model.templateId,
                format: model.table.value?.format,
                tidKey: model.tidKey,
                isEasy: hall.isPointsEasyMode(),
                isMultiple: hall.isMultipleRummyOpen(),
                isBump: hall.isBumpRummyOpen(),
            });
        });
    }

    /** Prefab `leader_boards` customEventData → open in-room challenger rank. */
    public onLeaderBoardsBtnClick(): void {
        void this.openChallengerLeaderboard();
    }

    private async openChallengerLeaderboard(): Promise<void> {
        const vid = this.GetModel(RummyModel).vid || this.tableVid;
        const tidKey = this.GetModel(RummyModel).tidKey;
        try {
            const mod = await import("../../../../function/tableChrome/roomLeaderboard/script/GameActLeaderboardModule");
            const { GameActLeaderboardOpenData } = await import(
                "../../../../function/tableChrome/roomLeaderboard/script/config/GameActLeaderboardProtocol"
            );
            mod.openRoomChallenger(new GameActLeaderboardOpenData(vid, tidKey));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] openChallengerLeaderboard {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private async checkChallengerLeaderboard(): Promise<void> {
        const entry = getManifestEntry(BundleKey.RoomLeaderboard);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../function/tableChrome/roomLeaderboard/script/GameActLeaderboardModule");
            const events = await import(
                "../../../../function/tableChrome/roomLeaderboard/script/event/GameActLeaderboardEvents"
            );
            const { RummyChallengerProgressView } = await import("../ui/RummyChallengerProgressView");
            mod.ensureGameActLeaderboardRegistered();
            const btn = this.findChildByName(this.node, "leader_boards_btn");
            if (btn && !btn.getComponent(RummyChallengerProgressView)) {
                btn.addComponent(RummyChallengerProgressView);
            }
            const progressView = btn?.getComponent(RummyChallengerProgressView);
            btn?.off(Button.EventType.CLICK);
            btn?.on(Button.EventType.CLICK, () => this.onLeaderBoardsBtnClick(), this);
            GameApp.Interface.RegisterEvent(
                events.RoomChallengerVisibilityEvent,
                (e: InstanceType<typeof events.RoomChallengerVisibilityEvent>) => {
                    progressView?.setLeaderBoardsVisible(e.show, e.totalReward);
                },
                this,
            ).UnRegisterWhenGameObjectDestroyed(this.node);
            const vid = this.GetModel(RummyModel).vid || this.tableVid;
            mod.prefetchRoomPage(vid);
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] checkChallengerLeaderboard {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供 RummyMain `gullak_btn` 绑定 */
    public onGullakBtnClick(): void {
        void this.openPiggyBankInRoom();
    }

    /** 供局内入口绑定：周月卡（Act_104） */
    public onWeeklyMonthInRoomClick(): void {
        void this.openWeeklyMonthInRoom();
    }

    private async openWeeklyMonthInRoom(): Promise<void> {
        const entry = getManifestEntry(BundleKey.WeeklyMonthCard);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../../activity/weeklymonthcard/script/WeeklyMonthCardModule");
            const { WeeklyMonthCardOpenData } = await import(
                "../../../../../activity/weeklymonthcard/script/config/WeeklyMonthCardConfig"
            );
            await mod.openWeeklyMonthCardDialog(new WeeklyMonthCardOpenData(this.tableVid, true, false, 1));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] openWeeklyMonthInRoom {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private async openPiggyBankInRoom(): Promise<void> {
        const entry = getManifestEntry(BundleKey.PiggyBank);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../../activity/piggy_bank/script/PiggyBankModule");
            const { PiggyBankOpenData } = await import(
                "../../../../../activity/piggy_bank/script/config/PiggyBankConfig"
            );
            await mod.openPiggyBankDialog(new PiggyBankOpenData(this.tableVid, true));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] openPiggyBankInRoom {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供局内入口绑定：买一得三（Act_125，对齐 ShowBuyOneGetThree） */
    public onBuyOneGetThreeClick(): void {
        void this.openPayOneForThreeInRoom();
    }

    public onFirstBuyInRoomClick(): void {
        void this.openRechargeInRoom("firstBuy");
    }

    public onWholeDayGiftInRoomClick(): void {
        void this.openRechargeInRoom("wholeDay");
    }

    public onRebateRechargeInRoomClick(): void {
        void this.openRechargeInRoom("rebate");
    }

    public onRestartGiftInRoomClick(): void {
        void this.openRechargeInRoom("restart");
    }

    public onConsecutiveGiftInRoomClick(): void {
        void this.openRechargeInRoom("consecutive");
    }

    private async openRechargeInRoom(
        kind: "firstBuy" | "wholeDay" | "rebate" | "restart" | "consecutive",
    ): Promise<void> {
        const entry = getManifestEntry(BundleKey.RechargeEvent);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../../activity/rechargeEvent/script/RechargeEventModule");
            const { RechargeOpenData } = await import(
                "../../../../../activity/rechargeEvent/script/config/RechargeEventConfig"
            );
            const data = new RechargeOpenData(this.tableVid, true);
            switch (kind) {
                case "firstBuy":
                    await mod.openFirstBuyDialog(data);
                    break;
                case "wholeDay":
                    await mod.openWholeDayGiftDialog(data);
                    break;
                case "rebate":
                    await mod.openRebateRechargeDialog(data);
                    break;
                case "restart":
                    await mod.openRestartGiftDialog(data);
                    break;
                case "consecutive":
                    await mod.openConsecutiveGiftDialog(data);
                    break;
            }
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] openRechargeInRoom {0} {1}",
                kind,
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private async openPayOneForThreeInRoom(): Promise<void> {
        const entry = getManifestEntry(BundleKey.PayOneForThree);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../../activity/payoneforthree/script/PayOneForThreeModule");
            const { PayOneForThreeOpenData } = await import(
                "../../../../../activity/payoneforthree/script/config/PayOneForThreeConfig"
            );
            await mod.openPayOneForThreeGameDialog(
                new PayOneForThreeOpenData(this.tableVid, true, false, true),
            );
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] openPayOneForThreeInRoom {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    /** 供 RummyMain `novicesTask_btn` 绑定 */
    public onNovicesTaskBtnClick(): void {
        void this.openNovicesTaskDialog();
    }

    private async openNovicesTaskDialog(): Promise<void> {
        const entry = getManifestEntry(BundleKey.NewPlayerTask);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const mod = await import("../../../../../activity/newPlayerTask/script/NewPlayerTaskModule");
            const { NewPlayerTaskOpenData } = await import(
                "../../../../../activity/newPlayerTask/script/config/NewPlayerTaskConfig"
            );
            await mod.openNewPlayerTaskDialog(new NewPlayerTaskOpenData(this.tableVid, true));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] openNovicesTaskDialog {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private async checkGullakHud(): Promise<void> {
        const entry = getManifestEntry(BundleKey.PiggyBank);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const events = await import("../../../../../activity/piggy_bank/script/event/PiggyBankEvents");
            const utilMod = await import("../../../../../activity/piggy_bank/script/utility/PiggyBankUtility");
            const mod = await import("../../../../../activity/piggy_bank/script/PiggyBankModule");
            const modelMod = await import("../../../../../activity/piggy_bank/script/model/PiggyBankModel");
            mod.ensurePiggyBankRegistered();
            const btn = this.resolveGullakBtn();
            let lastFull = -1;
            btn?.off(Button.EventType.CLICK);
            btn?.on(Button.EventType.CLICK, () => this.onGullakBtnClick(), this);
            GameApp.Interface.RegisterEvent(
                events.PiggyBankPageReadyEvent,
                () => {
                    const page = GameApp.Interface.GetModel(modelMod.PiggyBankModel).page.value;
                    const util = GameApp.Interface.GetUtility(utilMod.PiggyBankUtility);
                    const open = Number(page?.act_68_open ?? 0);
                    const full = Number(page?.full_status ?? 0);
                    const playBurst = lastFull === 0 && full === 1;
                    lastFull = full;
                    util.updateGullakBtn(btn, open, full, playBurst);
                },
                this,
            ).UnRegisterWhenGameObjectDestroyed(this.node);
            const cmd = await import(
                "../../../../../activity/piggy_bank/script/command/FetchPiggyBankPageCommand"
            );
            GameApp.Interface.SendCommand(new cmd.FetchPiggyBankPageCommand(this.tableVid));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] checkGullakHud {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private resolveGullakBtn(): Node | null {
        if (this.gullakBtn) {
            return this.gullakBtn;
        }
        const found = this.node.getChildByPath?.("gullak_btn") ?? null;
        if (found) {
            return found;
        }
        return this.findChildByName(this.node, "gullak_btn");
    }

    private async checkNovicesTask(): Promise<void> {
        const entry = getManifestEntry(BundleKey.NewPlayerTask);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const events = await import(
                "../../../../../activity/newPlayerTask/script/event/NewPlayerTaskEvents"
            );
            const utilMod = await import(
                "../../../../../activity/newPlayerTask/script/utility/NewPlayerTaskUtility"
            );
            const mod = await import("../../../../../activity/newPlayerTask/script/NewPlayerTaskModule");
            const modelMod = await import(
                "../../../../../activity/newPlayerTask/script/model/NewPlayerTaskModel"
            );
            mod.ensureNewPlayerTaskRegistered();
            const btn = this.resolveNovicesTaskBtn();
            btn?.off(Button.EventType.CLICK);
            btn?.on(Button.EventType.CLICK, () => this.onNovicesTaskBtnClick(), this);
            GameApp.Interface.RegisterEvent(
                events.NewPlayerTaskPageReadyEvent,
                () => {
                    const page = GameApp.Interface.GetModel(modelMod.NewPlayerTaskModel).page.value;
                    const util = GameApp.Interface.GetUtility(utilMod.NewPlayerTaskUtility);
                    const show = Number(page?.show ?? 0) === 1;
                    util.updateNovicesTaskBtn(btn, page?.progress, show);
                },
                this,
            ).UnRegisterWhenGameObjectDestroyed(this.node);
            const cmd = await import(
                "../../../../../activity/newPlayerTask/script/command/FetchNewPlayerTaskPageCommand"
            );
            GameApp.Interface.SendCommand(new cmd.FetchNewPlayerTaskPageCommand(this.tableVid));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] checkNovicesTask {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private resolveNovicesTaskBtn(): Node | null {
        if (this.novicesTaskBtn) {
            return this.novicesTaskBtn;
        }
        const found = this.node.getChildByPath?.("novicesTask_btn") ?? null;
        if (found) {
            return found;
        }
        return this.findChildByName(this.node, "novicesTask_btn");
    }

    private findChildByName(root: Node, name: string): Node | null {
        if (root.name === name) {
            return root;
        }
        for (const child of root.children) {
            const hit = this.findChildByName(child, name);
            if (hit) {
                return hit;
            }
        }
        return null;
    }

    public leaveTable(): void {
        this.SendCommand(new LeaveSubGameCommand());
    }

    private async checkBeginnerFlipReward(): Promise<void> {
        const entry = getManifestEntry(BundleKey.BeginnerFlipTask);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const events = await import(
                "../../../../../activity/beginnerFlipTask/script/event/BeginnerFlipTaskEvents"
            );
            const mod = await import(
                "../../../../../activity/beginnerFlipTask/script/BeginnerFlipTaskModule"
            );
            mod.ensureBeginnerFlipTaskRegistered();
            GameApp.Interface.RegisterEvent(
                events.BeginnerFlipCheckReadyEvent,
                (e: InstanceType<typeof events.BeginnerFlipCheckReadyEvent>) => {
                    void mod.openBeginnerFlipGameDialog(e.taskData, e.vid, e.tidKey);
                },
                this,
            ).UnRegisterWhenGameObjectDestroyed(this.node);
            const cmd = await import(
                "../../../../../activity/beginnerFlipTask/script/command/CheckBeginnerFlipRewardCommand"
            );
            GameApp.Interface.SendCommand(new cmd.CheckBeginnerFlipRewardCommand("", ""));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] checkBeginnerFlipReward {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    private async checkEarthquakesChipReward(): Promise<void> {
        const entry = getManifestEntry(BundleKey.Earthquakes);
        try {
            await this.GetSystem(BundleSystem).loadBundle(entry.bundleName);
            const events = await import(
                "../../../../../activity/earthquakes/script/event/EarthquakesEvents"
            );
            const mod = await import("../../../../../activity/earthquakes/script/EarthquakesModule");
            const { EarthquakesOpenData } = await import(
                "../../../../../activity/earthquakes/script/config/EarthquakesConfig"
            );
            mod.ensureEarthquakesRegistered();
            GameApp.Interface.RegisterEvent(
                events.EarthquakesChipCheckReadyEvent,
                (e: InstanceType<typeof events.EarthquakesChipCheckReadyEvent>) => {
                    void mod.openEarthquakesGameDialog(
                        new EarthquakesOpenData(2, 0, 1, true, e.vid, e.player),
                    );
                },
                this,
            ).UnRegisterWhenGameObjectDestroyed(this.node);
            const cmd = await import(
                "../../../../../activity/earthquakes/script/command/CheckEarthquakesChipRewardCommand"
            );
            GameApp.Interface.SendCommand(new cmd.CheckEarthquakesChipRewardCommand(0, 6));
        } catch (err) {
            LogKit.W(
                "[RummyGameSceneController] checkEarthquakesChipReward {0}",
                err instanceof Error ? err.message : String(err),
            );
        }
    }

    protected onDestroy(): void {
        void import("../../../../function/tableChrome/networkOverlay/script/NetworkDelayModule").then((m) => m.detachNetworkDelayOverlay());
        game.off(Game.EVENT_SHOW, this.onForeground, this);
        game.off(Game.EVENT_HIDE, this.onBackground, this);
        void import("../../../../function/tableChrome/roomLeaderboard/script/event/GameActLeaderboardEvents").then((events) => {
            GameApp.Interface.SendEvent(new events.CloseRoomChallengerEvent());
        });
    }

    private onBackground(): void {
        this.backgroundAt = Date.now();
    }

    private onForeground(): void {
        const gap = Date.now() - this.backgroundAt;
        if (gap > 30000 || this.backgroundAt === 0) {
            this.SendCommand(new RummySyncTableCommand());
        } else if (gap > 0) {
            this.SendCommand(new RummyRejoinCommand());
        }
    }

    private async wireNetSignalBinder(): Promise<void> {
        const signalNode = this.findDeep("signal");
        const delayNode = this.findDeep("delay_ms");
        if (!signalNode) {
            return;
        }
        const mod = await import("../../../../function/tableChrome/networkOverlay/script/controller/NetSignalBinder");
        let binder = this.node.getComponent(mod.NetSignalBinder);
        if (!binder) {
            binder = this.node.addComponent(mod.NetSignalBinder);
        }
        binder.signal = signalNode.getComponent(Sprite);
        binder.delayMs = delayNode?.getComponent(Label) ?? null;
    }

    private findDeep(name: string): Node | null {
        const stack: Node[] = [this.node];
        while (stack.length) {
            const n = stack.pop()!;
            if (n.name === name) {
                return n;
            }
            for (const c of n.children) {
                stack.push(c);
            }
        }
        return find(name, this.node);
    }
}
