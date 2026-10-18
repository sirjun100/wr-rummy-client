import { _decorator, Button, Component, find } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { AudioSystem, BgmContext } from "../../../../../../script/game/system/AudioSystem";
import { SixpointBetCommand } from "../command/SixpointBetCommand";
import { SixpointChangeBetCommand } from "../command/SixpointChangeBetCommand";
import { SixpointHistoryCommand } from "../command/SixpointHistoryCommand";
import { SixpointPlayersPageCommand } from "../command/SixpointPlayersPageCommand";
import { SixpointRepeatBetCommand } from "../command/SixpointRepeatBetCommand";
import { SixpointSitDownCommand } from "../command/SixpointSitDownCommand";
import { SixpointStandUpCommand } from "../command/SixpointStandUpCommand";
import {
    SixpointBetAreasUpdatedEvent,
    SixpointEnterReadyEvent,
    SixpointOnlineCountEvent,
    SixpointPhaseBetEvent,
    SixpointPhaseRestEvent,
    SixpointRichPlayersEvent,
    SixpointRollResultEvent,
} from "../event/SixpointEvents";
import { SixpointModel } from "../model/SixpointModel";
import { ensureSixpointRegistered } from "../SixpointGameModule";
import { SixpointActionPanel } from "./SixpointActionPanel";
import { SixpointCardPlayerPanel } from "./SixpointCardPlayerPanel";
import { SixpointTablePanel } from "./SixpointTablePanel";
import { SixpointTipPanel } from "./SixpointTipPanel";
import { runSixpointRollSequence } from "../utility/SixpointRollSequence";

const { ccclass, property } = _decorator;

@ccclass("SixpointMainView")
export class SixpointMainView extends Component {
    @property(SixpointTablePanel)
    public tablePanel: SixpointTablePanel | null = null;

    @property(SixpointActionPanel)
    public actionPanel: SixpointActionPanel | null = null;

    @property(SixpointTipPanel)
    public tipPanel: SixpointTipPanel | null = null;

    @property(SixpointCardPlayerPanel)
    public cardPlayerPanel: SixpointCardPlayerPanel | null = null;

    private cdTimer: number = 0;

    protected onLoad(): void {
        ensureSixpointRegistered();
        const arch = GameApp.Interface;
        arch.RegisterEvent(SixpointEnterReadyEvent, () => this.onReady(), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        arch.RegisterEvent(SixpointPhaseBetEvent, (e) => this.onBetPhase(e.cd), this).UnRegisterWhenGameObjectDestroyed(
            this.node,
        );
        arch.RegisterEvent(SixpointPhaseRestEvent, () => {
            this.tablePanel?.resetInfo();
            this.tipPanel?.playRestAnim();
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        arch.RegisterEvent(SixpointRollResultEvent, (e) => {
            runSixpointRollSequence(
                e.payload,
                this.tipPanel,
                this.tablePanel,
                this.cardPlayerPanel,
                this,
            );
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        arch.RegisterEvent(SixpointBetAreasUpdatedEvent, (e) => {
            this.tablePanel?.applyAreas(e.areas);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        arch.RegisterEvent(SixpointOnlineCountEvent, (e) => {
            this.cardPlayerPanel?.updateNoSeatCount(e.count);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        arch.RegisterEvent(SixpointRichPlayersEvent, () => {
            this.syncRichSeats();
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);

        const model = arch.GetModel(SixpointModel);
        model.table.RegisterWithInitValue((t) => {
            if (t) {
                this.tablePanel?.applySnapshot(t);
                if (t.money != null) {
                    this.cardPlayerPanel?.updateSelfCoin(t.money);
                }
                this.actionPanel?.updateCurBetNum(model.curBet, model.betConfig);
                this.actionPanel?.resetBetAmtView(model.betConfig);
                this.actionPanel?.updateGullakBtnStatus(model.act98Show, 0, false);
                this.syncRichSeats();
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);

        this.wireButtons();
        this.schedule(this.tickCd, 1);
    }

    protected onDestroy(): void {
        this.unschedule(this.tickCd);
    }

    private tickCd(): void {
        const model = GameApp.Interface.GetModel(SixpointModel);
        if (model.gameState === 1 && model.gameCd > 0) {
            model.gameCd -= 1;
            const cd = model.gameCd;
            const audio = GameApp.Interface.GetSystem(AudioSystem);
            if (cd === 2 || cd === 1) {
                audio.playFx("xiazhu_stop1");
            } else if (cd === 0) {
                audio.playFx("xiazhu_stop2");
            }
        }
        this.actionPanel?.updateGameCd(model.gameCd, model.gameState);
    }

    private wireButtons(): void {
        const root = find("root", this.node) ?? this.node;
        for (let i = 0; i < 6; i++) {
            const area = find(`btn_xz_area${i}`, root);
            if (area) {
                const btn = area.getComponent(Button);
                btn?.node.on(Button.EventType.CLICK, () => {
                    GameApp.Interface.SendCommand(new SixpointBetCommand(i));
                });
            }
        }
        const repeat = find("btn_repeat", root);
        repeat?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            GameApp.Interface.SendCommand(new SixpointRepeatBetCommand());
        });
        const trend = find("btn_trend", root);
        trend?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            GameApp.Interface.SendCommand(new SixpointHistoryCommand());
        });
        const close = find("menu_btn", root) ?? find("btn_close", root);
        close?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => this.onLeave());
        for (let i = 0; i < 6; i++) {
            const betChip = find(`bet${i}`, root);
            betChip?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
                GameApp.Interface.SendCommand(new SixpointChangeBetCommand(i));
            });
        }
        const cardRoot = find("card_player_root", root);
        for (let i = 0; i < 6; i++) {
            const seat = find(`player${i}`, cardRoot ?? root);
            seat?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
                GameApp.Interface.SendCommand(new SixpointSitDownCommand(i));
            });
        }
        const player7 = find("player7", cardRoot ?? root);
        player7?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            GameApp.Interface.SendCommand(new SixpointPlayersPageCommand(1));
        });
        const stand = find("stand_btn", root) ?? find("btn_stand", root);
        stand?.getComponent(Button)?.node.on(Button.EventType.CLICK, () => {
            GameApp.Interface.SendCommand(new SixpointStandUpCommand());
        });
    }

    private syncRichSeats(): void {
        const model = GameApp.Interface.GetModel(SixpointModel);
        const rich = model.table.value?.rich_players ?? [];
        for (let i = 0; i < 6; i++) {
            const row = rich[i] as { uid?: number } | undefined;
            if (row?.uid) {
                this.cardPlayerPanel?.setSeatVisible(i, true);
            } else {
                this.cardPlayerPanel?.resetTuhaoSeat(i);
            }
        }
    }

    private onReady(): void {
        GameApp.Interface.GetSystem(AudioSystem).switchBgm(BgmContext.Room);
        GameApp.Interface.GetSystem(AudioSystem).playFx("start_xiazhu");
        const model = GameApp.Interface.GetModel(SixpointModel);
        if (model.table.value) {
            this.tablePanel?.applySnapshot(model.table.value);
        }
    }

    private onBetPhase(cd: number): void {
        const model = GameApp.Interface.GetModel(SixpointModel);
        model.gameCd = cd;
        this.tipPanel?.playStartGameAnim();
        GameApp.Interface.GetSystem(AudioSystem).playFx("start_xiazhu");
    }

    public onLeave(): void {
        GameApp.Interface.SendCommand(new LeaveSubGameCommand());
    }
}
