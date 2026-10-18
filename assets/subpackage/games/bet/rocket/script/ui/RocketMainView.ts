import { _decorator, Component, Label } from "cc";
import { GameApp } from "../../../../../../script/game/GameApp";
import { LeaveSubGameCommand } from "../../../../../../script/game/command/LeaveSubGameCommand";
import { AudioSystem, BgmContext } from "../../../../../../script/game/system/AudioSystem";
import { RocketBetCommand } from "../command/RocketBetCommand";
import { RocketCancelBetCommand } from "../command/RocketCancelBetCommand";
import { RocketCashOutCommand } from "../command/RocketCashOutCommand";
import { RocketSyncTableCommand } from "../command/RocketSyncTableCommand";
import {
    RocketEnterReadyEvent,
    RocketPhaseBetEvent,
    RocketPhaseEndEvent,
    RocketPhaseFlyEvent,
    RocketBtStateUpdatedEvent,
    RocketSomeoneCashOutEvent,
    RocketWinRateTickEvent,
} from "../event/RocketEvents";
import { RocketModel } from "../model/RocketModel";
import { ensureRocketRegistered } from "../RocketGameModule";
import { RocketTablePanel } from "./RocketTablePanel";
import { RocketActionPanel } from "./RocketActionPanel";

const { ccclass, property } = _decorator;

@ccclass("RocketMainView")
export class RocketMainView extends Component {
    @property(RocketTablePanel)
    public tablePanel: RocketTablePanel | null = null;

    @property(RocketActionPanel)
    public actionPanel: RocketActionPanel | null = null;

    @property(Label)
    public winRateLabel: Label | null = null;

    @property(Label)
    public cdLabel: Label | null = null;

    protected onLoad(): void {
        ensureRocketRegistered();

        GameApp.Interface.RegisterEvent(RocketEnterReadyEvent, () => this.onTableReady(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RocketPhaseBetEvent, (e) => this.onBetPhase(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RocketPhaseFlyEvent, () => this.onFlyPhase(), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RocketPhaseEndEvent, (e) => this.onEndPhase(e), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RocketWinRateTickEvent, (e) => this.onWinRate(e.winRate), this)
            .UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RocketBtStateUpdatedEvent, (e) => {
            for (let i = 0; i < e.btState.length; i++) {
                this.actionPanel?.updateButtonState(e.btState[i], i, e.ext);
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
        GameApp.Interface.RegisterEvent(RocketSomeoneCashOutEvent, (e) => {
            this.tablePanel?.showCrash(Number(e.payload.win_rate ?? 0), false);
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);

        const model = GameApp.Interface.GetModel(RocketModel);
        model.table.RegisterWithInitValue((t) => {
            if (t) {
                this.applyTable(t);
            }
        }, this).UnRegisterWhenGameObjectDestroyed(this.node);
    }

    public onLeave(): void {
        GameApp.Interface.SendCommand(new LeaveSubGameCommand());
    }

    public onBet(slot: number): void {
        const model = GameApp.Interface.GetModel(RocketModel);
        GameApp.Interface.SendCommand(new RocketBetCommand(slot, model.curBet[slot]));
    }

    public onCancel(slot: number): void {
        GameApp.Interface.SendCommand(new RocketCancelBetCommand(slot));
    }

    public onCashOut(slot: number): void {
        GameApp.Interface.SendCommand(new RocketCashOutCommand(slot));
    }

    public onResync(): void {
        GameApp.Interface.SendCommand(new RocketSyncTableCommand(true));
    }

    private onTableReady(): void {
        const model = GameApp.Interface.GetModel(RocketModel);
        if (model.table.value) {
            this.applyTable(model.table.value);
        }
        GameApp.Interface.GetSystem(AudioSystem).switchBgm(BgmContext.Room);
        GameApp.Interface.GetSystem(AudioSystem).playFx("start_xiazhu");
    }

    private applyTable(dto: import("../config/RocketProtocol").RocketTableDto): void {
        this.tablePanel?.applySnapshot(dto);
        this.actionPanel?.applySnapshot(dto);
        if (dto.win_rate != null) {
            this.onWinRate(dto.win_rate);
        }
        if (dto.cd != null && this.cdLabel) {
            this.cdLabel.string = `${dto.cd}`;
        }
    }

    private onBetPhase(e: RocketPhaseBetEvent): void {
        GameApp.Interface.GetSystem(AudioSystem).switchBgm(BgmContext.Room);
        GameApp.Interface.GetSystem(AudioSystem).playFx("start_xiazhu");
        this.tablePanel?.showBetting(e.cd, e.totalCd);
        if (this.cdLabel) {
            this.cdLabel.string = `${e.cd}`;
        }
    }

    private onFlyPhase(): void {
        GameApp.Interface.GetSystem(AudioSystem).switchBgm(BgmContext.Room);
        this.tablePanel?.rocketPlayFly(0, 1, (rate) => this.onWinRate(rate));
    }

    private onEndPhase(e: RocketPhaseEndEvent): void {
        this.tablePanel?.showCrash(e.winRate, e.playAnim);
        GameApp.Interface.SendCommand(new RocketSyncTableCommand());
    }

    private onWinRate(rate: number): void {
        if (this.winRateLabel) {
            this.winRateLabel.string = `${rate.toFixed(2)}x`;
        }
        this.tablePanel?.updateMultiplier(rate);
    }
}
