import { _decorator, Button, Node } from "cc";
import { GameApp } from "../../../../../script/game/GameApp";
import { BaseDialog } from "../../../../../script/game/controller/engine/BaseDialog";
import { AudioFxId } from "../../../../../script/game/config/AudioFxId";
import { AudioSystem } from "../../../../../script/game/system/AudioSystem";
import { WalletModel } from "../../../../../script/game/model/WalletModel";
import { UISystem } from "../../../../../script/game/system/UISystem";
import { HallConfigModel } from "../../hallMenu/script/model/HallConfigModel";
import { SelectionGameType, SelectionRummyType } from "../config/SelectionVenueConfig";
import type { RoomCatalogEntryDto, SelectionVenueOpenData } from "../config/SelectionVenueProtocol";
import { EnterRummyFromSelectionCommand } from "../command/EnterRummyFromSelectionCommand";
import { OpenFilterMatchFromSelectionCommand } from "../command/OpenFilterMatchFromSelectionCommand";
import { RoomEntryInfoBinder } from "../controller/RoomEntryInfoBinder";
import { RoomSliderBinder } from "../controller/RoomSliderBinder";
import { SelectionVenueModel } from "../model/SelectionVenueModel";
import { filterSelectRoomList, recommendRoomIndex } from "../utility/SelectionVenueRoomFilter";
import { findDeep } from "../utility/SelectionVenueUiHelper";
import { ensureSelectionVenueRegistered } from "../SelectionVenueModule";

const { ccclass, property } = _decorator;

@ccclass("RummySelectionDialog")
export class RummySelectionDialog extends BaseDialog {
    @property(Node)
    public roomInfoNode: Node = null;

    @property(Node)
    public rummyTypeNode: Node = null;

    @property(Node)
    public tournamentNode: Node = null;

    private entryBinder: RoomEntryInfoBinder | null = null;

    private sliderBinder: RoomSliderBinder | null = null;

    private rooms: RoomCatalogEntryDto[] = [];

    protected OnInit(uiData: SelectionVenueOpenData = null): void {
        ensureSelectionVenueRegistered();
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        if (uiData) {
            model.applyOpenData(uiData);
        }
        const roomInfo = this.roomInfoNode ?? findDeep(this.node, "room_info");
        this.entryBinder = new RoomEntryInfoBinder(roomInfo);
        this.sliderBinder = new RoomSliderBinder(roomInfo);
        this.sliderBinder.bind((idx) => this.setRoomIndex(idx));
        this.wireClose();
        this.wireGameTypeTabs();
        this.wireRummyTabs();
        this.wirePlayerPoolDeals();
        this.wireStartButtons();
        model.catalog.Register(() => this.refreshRooms(), this).UnRegisterWhenGameObjectDestroyed(this.node);
        model.ui.Register(() => this.refreshRooms(), this).UnRegisterWhenGameObjectDestroyed(this.node);
        this.refreshRooms();
        this.updateGameTypeUi(model.ui.value.gameType);
        void this.bindRankStar();
    }

    private bindRankStar(): void {
        const rankNode = findDeep(this.node, "rankInnerNode");
        if (!rankNode) {
            return;
        }
        void import("../../hallMenu/script/model/HallPlayerModel").then(({ HallPlayerModel }) => {
            const model = GameApp.Interface.GetModel(HallPlayerModel);
            model.player.RegisterWithInitValue((p) => {
                rankNode.active = Number(p.challenger_open ?? 1) === 1;
            }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        });
    }

    protected OnClose(): void {}

    public onClickByTab(_e: unknown, tab: string): void {
        this.playClick();
        if (tab === "point") {
            this.setRummyType(SelectionRummyType.Points);
        } else if (tab === "pool") {
            this.setRummyType(SelectionRummyType.Pool);
        } else if (tab === "deal" || tab === "deals") {
            this.setRummyType(SelectionRummyType.Deals);
        }
    }

    public onStartGameClick(_e: unknown, action: string): void {
        this.playClick();
        if (action === "addcash") {
            void this.openFastBuy();
            return;
        }
        this.tryPlayNow();
    }

    public onBuddyGameClick(_e: unknown, action: string): void {
        this.playClick();
        if (action === "join") {
            void import("../../../../shared/commonUi/script/PublicModule").then((m) => m.openBuddyJoin());
            return;
        }
        if (action === "create") {
            GameApp.Interface.GetSystem(UISystem).showToast("Private room create — server route pending");
        }
    }

    public onModeHelpClick(): void {
        void import("../../../../tableChrome/gameRules/script/RegularModule").then((m) => {
            const hall = GameApp.Interface.GetModel(HallConfigModel);
            m.openHallRegular({
                isEasy: hall.isPointsEasyMode(),
                isMultiple: hall.isMultipleRummyOpen(),
                isBump: hall.isBumpRummyOpen(),
            });
        });
    }

    public onDoubleRummyHelpClick(): void {
        void import("../../lobby/script/ui/dialogs/DoubleRummyTypeDialog").then(({ DoubleRummyTypeDialog }) => {
            void import("../../../../../script/game/config/BundleManifest").then(({ BundleKey }) => {
                void import("../../../../../script/game/system/BundleSystem").then(({ BundleSystem }) => {
                    void GameApp.Interface.GetSystem(BundleSystem).loadBundle("lobby").then(() => {
                        void GameApp.Interface.GetSystem(UISystem).openDialogAsync(
                            DoubleRummyTypeDialog,
                            BundleKey.Lobby,
                            "DoubleRummyTypeDialog",
                            {},
                        );
                    });
                });
            });
        });
    }

    private wireClose(): void {
        for (const name of ["close", "back", "back_big"]) {
            const n = findDeep(this.node, name);
            n?.off(Button.EventType.CLICK);
            n?.on(Button.EventType.CLICK, () => this.CloseSelf(), this);
        }
    }

    private wireGameTypeTabs(): void {
        const map: Array<[string, SelectionGameType]> = [
            ["btn_cash", SelectionGameType.Cash],
            ["btn_match", SelectionGameType.Match],
            ["btn_buddy", SelectionGameType.Buddy],
            ["btn_practice", SelectionGameType.Practice],
        ];
        for (const [name, type] of map) {
            const btn = findDeep(this.node, name);
            btn?.off(Button.EventType.CLICK);
            btn?.on(Button.EventType.CLICK, () => this.setGameType(type), this);
        }
    }

    private wireRummyTabs(): void {
        for (const tab of ["btn_point", "btn_pool", "btn_deal", "btn_deals"]) {
            const n = findDeep(this.node, tab) ?? findDeep(findDeep(this.node, "rummy_switch"), tab.replace("btn_", ""));
            n?.off(Button.EventType.CLICK);
            const data = tab.includes("pool") ? "pool" : tab.includes("deal") ? "deal" : "point";
            n?.on(Button.EventType.CLICK, () => this.onClickByTab(null, data), this);
        }
    }

    private wirePlayerPoolDeals(): void {
        const roomInfo = this.roomInfoNode ?? findDeep(this.node, "room_info");
        const playerSelect = findDeep(roomInfo, "player_select");
        playerSelect?.getChildByName("btn_switch1")?.on(Button.EventType.CLICK, () => this.setPlayers(2), this);
        playerSelect?.getChildByName("btn_switch2")?.on(Button.EventType.CLICK, () => this.setPlayers(6), this);
        const poolSelect = findDeep(roomInfo, "pool_select");
        poolSelect?.getChildByName("btn_switch1")?.on(Button.EventType.CLICK, () => this.setPool(101), this);
        poolSelect?.getChildByName("btn_switch2")?.on(Button.EventType.CLICK, () => this.setPool(201), this);
        const dealsSelect = findDeep(roomInfo, "deals_select");
        dealsSelect?.getChildByName("btn_switch1")?.on(Button.EventType.CLICK, () => this.setDeals(2), this);
        dealsSelect?.getChildByName("btn_switch2")?.on(Button.EventType.CLICK, () => this.setDeals(6), this);
    }

    private wireStartButtons(): void {
        const roomInfo = this.roomInfoNode ?? findDeep(this.node, "room_info");
        const start = findDeep(roomInfo, "btn_start");
        const addCash = findDeep(roomInfo, "btn_addcash");
        const create = findDeep(roomInfo, "btn_create");
        const join = findDeep(roomInfo, "btn_join");
        start?.off(Button.EventType.CLICK);
        addCash?.off(Button.EventType.CLICK);
        start?.on(Button.EventType.CLICK, () => this.onStartGameClick(null, "start"), this);
        addCash?.on(Button.EventType.CLICK, () => this.onStartGameClick(null, "addcash"), this);
        create?.on(Button.EventType.CLICK, () => this.onBuddyGameClick(null, "create"), this);
        join?.on(Button.EventType.CLICK, () => this.onBuddyGameClick(null, "join"), this);
        const modeHelp = findDeep(roomInfo, "mode_help") ?? findDeep(this.node, "modeHelpBtn");
        modeHelp?.on(Button.EventType.CLICK, () => this.onModeHelpClick(), this);
    }

    private setGameType(gameType: SelectionGameType): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        if (gameType === SelectionGameType.Match) {
            GameApp.Interface.SendCommand(new OpenFilterMatchFromSelectionCommand());
            return;
        }
        if (gameType !== SelectionGameType.Cash && gameType !== SelectionGameType.Practice && gameType !== SelectionGameType.Buddy) {
            GameApp.Interface.GetSystem(UISystem).showToast("Coming soon");
            return;
        }
        model.ui.value = { ...model.ui.value, gameType };
        this.updateGameTypeUi(gameType);
        this.refreshRooms();
    }

    private updateGameTypeUi(gameType: SelectionGameType): void {
        const roomInfo = this.roomInfoNode ?? findDeep(this.node, "room_info");
        const tour = this.tournamentNode ?? findDeep(this.node, "tournament");
        const rummy = this.rummyTypeNode ?? findDeep(this.node, "rummy_switch")?.parent;
        if (roomInfo) {
            roomInfo.active = gameType !== SelectionGameType.Match;
        }
        if (tour) {
            tour.active = gameType === SelectionGameType.Match;
        }
        if (rummy) {
            rummy.active = gameType !== SelectionGameType.Match;
        }
        const start = findDeep(roomInfo, "btn_start");
        const create = findDeep(roomInfo, "btn_create");
        const join = findDeep(roomInfo, "btn_join");
        if (start) {
            start.active = gameType !== SelectionGameType.Buddy;
        }
        if (create && join) {
            const buddy = gameType === SelectionGameType.Buddy;
            create.active = buddy;
            join.active = buddy;
        }
    }

    private setRummyType(rummyType: SelectionRummyType): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        model.ui.value = { ...model.ui.value, rummyType };
        this.refreshRooms();
    }

    private setPlayers(n: number): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        model.ui.value = { ...model.ui.value, selectPlayers: n };
        this.refreshRooms();
    }

    private setPool(n: number): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        model.ui.value = { ...model.ui.value, selectPool: n };
        this.refreshRooms();
    }

    private setDeals(n: number): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        model.ui.value = { ...model.ui.value, selectDeals: n };
        this.refreshRooms();
    }

    private setRoomIndex(idx: number): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        model.ui.value = { ...model.ui.value, roomIndex: idx };
        this.entryBinder?.apply(this.rooms[idx] ?? null);
        this.sliderBinder?.render(this.rooms, idx);
        this.updateStartButtonState(this.rooms[idx]);
    }

    private refreshRooms(): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        const ui = model.ui.value;
        const hall = GameApp.Interface.GetModel(HallConfigModel);
        const flags = {
            bump2: hall.isBumpRummyOpen(),
            bump6: hall.isBumpRummyOpen(),
            multiple2: hall.isMultipleRummyOpen(),
            multiple6: hall.isMultipleRummyOpen(),
            double6: hall.isDouble6Open(),
        };
        this.rooms = filterSelectRoomList(
            model.catalog.value,
            ui.gameType,
            ui.rummyType,
            ui.selectPlayers,
            ui.selectPool,
            ui.selectDeals,
            ui.selectMode,
            flags,
        );
        model.filteredRooms.value = this.rooms;
        const balance = this.walletBalance(false);
        let idx = ui.roomIndex;
        if (idx >= this.rooms.length) {
            idx = recommendRoomIndex(this.rooms, balance);
        }
        this.setRoomIndex(idx);
    }

    private updateStartButtonState(entry: RoomCatalogEntryDto | undefined): void {
        const roomInfo = this.roomInfoNode ?? findDeep(this.node, "room_info");
        const start = findDeep(roomInfo, "btn_start");
        const addCash = findDeep(roomInfo, "btn_addcash");
        if (!entry || !start) {
            return;
        }
        const min = Number(entry.entry ?? entry.min_money ?? 0);
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        const balance = this.walletBalance(model.ui.value.gameType === SelectionGameType.Practice);
        const enough = balance >= min;
        start.active = enough;
        if (addCash) {
            addCash.active = !enough && model.ui.value.gameType === SelectionGameType.Cash;
        }
    }

    private tryPlayNow(): void {
        const model = GameApp.Interface.GetModel(SelectionVenueModel);
        const idx = model.ui.value.roomIndex;
        const entry = this.rooms[idx];
        if (!entry?.vid) {
            GameApp.Interface.GetSystem(UISystem).showToast("No table available");
            return;
        }
        GameApp.Interface.SendCommand(new EnterRummyFromSelectionCommand(entry));
    }

    private async openFastBuy(): Promise<void> {
        const entry = this.rooms[GameApp.Interface.GetModel(SelectionVenueModel).ui.value.roomIndex];
        const min = Number(entry?.entry ?? entry?.min_money ?? 0);
        const { FastBuyOpenData } = await import("../../../../../script/game/commerce/config/PaymentProtocol");
        await import("../../../../commerce/wallet/script/PurseModule").then((m) =>
            m.openHallFastBuy(new FastBuyOpenData("hall", 0, 0, 0, min)),
        );
    }

    private walletBalance(_practice: boolean): number {
        const w = GameApp.Interface.GetModel(WalletModel).snapshot.value;
        if (w.balance != null) {
            return Number(w.balance);
        }
        return Number(w.deposit ?? 0) + Number(w.winnings ?? 0);
    }

    private playClick(): void {
        GameApp.Interface.GetSystem(AudioSystem).playFx(AudioFxId.Click);
    }
}
